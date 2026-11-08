Pod::Spec.new do |s|
  s.name             = 'IONFilesystemLib'
  s.version          = '1.1.4'
  s.summary          = 'ION Filesystem library (vendored; avoids GitHub release CDN 504s in CI)'
  s.homepage         = 'https://github.com/ionic-team/ion-ios-filesystem'
  s.license          = { :type => 'MIT' }
  s.author           = { 'Ionic' => 'hi@ionic.io' }
  s.source           = { :path => '.' }
  s.vendored_frameworks = 'IONFilesystemLib.xcframework'
  s.ios.deployment_target = '14.0'
end
