Pod::Spec.new do |s|
  s.name             = 'IONGeolocationLib'
  s.version          = '1.0.1'
  s.summary          = 'ION Geolocation library (vendored; avoids GitHub release CDN 504s in CI)'
  s.homepage         = 'https://github.com/ionic-team/ion-ios-geolocation'
  s.license          = { :type => 'MIT' }
  s.author           = { 'Ionic' => 'hi@ionic.io' }
  s.source           = { :path => '.' }
  s.vendored_frameworks = 'IONGeolocationLib.xcframework'
  s.ios.deployment_target = '14.0'
end
