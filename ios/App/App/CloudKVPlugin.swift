import Foundation
import Capacitor

/// 1.4.54 iCloud save sync: a thin bridge to NSUbiquitousKeyValueStore (the user's own iCloud key-value storage).
/// The JS side (src/native/cloud.ts) decides what to store and when; this plugin only reads / writes one string
/// value and reports external changes (another device, the first sync after install, quota, account change).
@objc(CloudKVPlugin)
public class CloudKVPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CloudKVPlugin"
    public let jsName = "CloudKV"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "get", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "set", returnType: CAPPluginReturnPromise)
    ]

    private let store = NSUbiquitousKeyValueStore.default
    private var initialSync = false
    private var lastReason = -1

    override public func load() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(externalChange(_:)),
            name: NSUbiquitousKeyValueStore.didChangeExternallyNotification,
            object: store
        )
        store.synchronize()
    }

    @objc private func externalChange(_ note: Notification) {
        let reason = (note.userInfo?[NSUbiquitousKeyValueStoreChangeReasonKey] as? Int) ?? -1
        let keys = (note.userInfo?[NSUbiquitousKeyValueStoreChangedKeysKey] as? [String]) ?? []
        lastReason = reason
        if reason == NSUbiquitousKeyValueStoreInitialSyncChange { initialSync = true }
        notifyListeners("change", data: ["reason": reason, "keys": keys])
    }

    @objc func status(_ call: CAPPluginCall) {
        call.resolve([
            "available": FileManager.default.ubiquityIdentityToken != nil,
            "initialSync": initialSync,
            "lastReason": lastReason
        ])
    }

    @objc func get(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else {
            call.reject("key missing")
            return
        }
        store.synchronize()
        if let value = store.string(forKey: key) {
            call.resolve(["value": value])
        } else {
            call.resolve(["value": NSNull()])
        }
    }

    @objc func set(_ call: CAPPluginCall) {
        guard let key = call.getString("key"), let value = call.getString("value") else {
            call.reject("key or value missing")
            return
        }
        store.set(value, forKey: key)
        call.resolve(["ok": store.synchronize()])
    }
}

/// Registers the app's own plugins (npm plugins are registered by Capacitor itself).
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(CloudKVPlugin())
        bridge?.registerPluginInstance(TreeTimelapsePlugin())
    }
}
