#!/usr/bin/env ruby
# 1.4.54: make sure the App ID has the iCloud capability (needed for the key-value-storage entitlement), using the
# App Store Connect API key the workflow already has. Idempotent: does nothing when iCloud is already on.
# Env: ASC_KEY_PATH, ASC_KEY_ID, ASC_ISSUER_ID, BUNDLE_ID (default app.sekaitree.game).
require 'openssl'
require 'json'
require 'net/http'
require 'base64'

KEY = OpenSSL::PKey::EC.new(File.read(ENV.fetch('ASC_KEY_PATH')))
BUNDLE = ENV['BUNDLE_ID'] || 'app.sekaitree.game'

def b64(s)
  Base64.urlsafe_encode64(s, padding: false)
end

def jwt
  header = { alg: 'ES256', kid: ENV.fetch('ASC_KEY_ID'), typ: 'JWT' }
  now = Time.now.to_i
  claims = { iss: ENV.fetch('ASC_ISSUER_ID'), iat: now, exp: now + 600, aud: 'appstoreconnect-v1' }
  input = "#{b64(header.to_json)}.#{b64(claims.to_json)}"
  der = KEY.sign(OpenSSL::Digest::SHA256.new, input)
  r, s = OpenSSL::ASN1.decode(der).value.map { |v| v.value.to_s(2).rjust(32, "\0")[-32..] }
  "#{input}.#{b64(r + s)}"
end

def api(method, path, body = nil)
  uri = URI("https://api.appstoreconnect.apple.com#{path}")
  req = (method == :get ? Net::HTTP::Get : Net::HTTP::Post).new(uri)
  req['Authorization'] = "Bearer #{jwt}"
  req['Content-Type'] = 'application/json'
  req.body = body.to_json if body
  res = Net::HTTP.start(uri.host, uri.port, use_ssl: true) { |h| h.request(req) }
  [res.code.to_i, (JSON.parse(res.body) rescue {})]
end

code, list = api(:get, "/v1/bundleIds?filter[identifier]=#{BUNDLE}&limit=20")
abort "bundleIds lookup failed (#{code}): #{list['errors']&.map { |e| e['detail'] }&.join('; ')}" unless code == 200
bundle = list['data'].find { |d| d.dig('attributes', 'identifier') == BUNDLE }
abort "App ID #{BUNDLE} not found" unless bundle
code, caps = api(:get, "/v1/bundleIds/#{bundle['id']}/bundleIdCapabilities")
abort "capabilities lookup failed (#{code})" unless code == 200
types = caps['data'].map { |c| c.dig('attributes', 'capabilityType') }
puts "App ID #{BUNDLE} capabilities: #{types.join(', ')}"
if types.include?('ICLOUD')
  puts 'iCloud already enabled'
  exit 0
end
code, res = api(:post, '/v1/bundleIdCapabilities', {
  data: {
    type: 'bundleIdCapabilities',
    attributes: { capabilityType: 'ICLOUD', settings: [{ key: 'ICLOUD_VERSION', options: [{ key: 'XCODE_6' }] }] },
    relationships: { bundleId: { data: { type: 'bundleIds', id: bundle['id'] } } }
  }
})
abort "enabling iCloud failed (#{code}): #{res['errors']&.map { |e| e['detail'] }&.join('; ')}" unless code == 201
puts 'iCloud capability enabled on the App ID'
