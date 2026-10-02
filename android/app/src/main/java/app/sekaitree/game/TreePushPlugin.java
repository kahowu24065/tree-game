package app.sekaitree.game;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * 1.4.31: tells JS whether Firebase is configured in this build (google-services.json had a client for this
 * package, so the google-services plugin generated google_app_id). Without it PushNotifications.register()
 * would throw on the main thread and crash the app, so JS skips push instead.
 */
@CapacitorPlugin(name = "TreePush")
public class TreePushPlugin extends Plugin {

    @PluginMethod
    public void available(PluginCall call) {
        var ctx = getContext();
        int id = ctx.getResources().getIdentifier("google_app_id", "string", ctx.getPackageName());
        JSObject ret = new JSObject();
        ret.put("ok", id != 0);
        call.resolve(ret);
    }
}
