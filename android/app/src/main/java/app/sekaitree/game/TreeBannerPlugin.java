package app.sekaitree.game;

import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.MobileAds;

/**
 * Banner over the web slot at the bottom of the screen. The page reserves 50px;
 * this view uses the same bottom inset as the WebView so it sits in that slot.
 */
@CapacitorPlugin(name = "TreeBanner")
public class TreeBannerPlugin extends Plugin {

    private AdView adView;
    private boolean wantVisible;
    private boolean sdkReady;
    private boolean requested;

    @Override
    public void load() {
        var activity = getActivity();
        if (activity == null) return;
        activity.runOnUiThread(this::attach);
    }

    private void attach() {
        var activity = getActivity();
        if (activity == null || adView != null) return;

        AdView banner = new AdView(activity);
        banner.setAdSize(AdSize.BANNER);
        banner.setAdUnitId(activity.getString(R.string.admob_banner_id));
        banner.setVisibility(View.GONE);

        FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        params.gravity = Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
        activity.addContentView(banner, params);
        adView = banner;

        View web = activity.findViewById(com.getcapacitor.android.R.id.webview);
        if (web != null) {
            web.addOnLayoutChangeListener((v, left, top, right, bottom, oldLeft, oldTop, oldRight, oldBottom) -> alignToWeb(web));
            web.post(() -> alignToWeb(web));
        }

        MobileAds.initialize(activity, status -> activity.runOnUiThread(() -> {
            sdkReady = true;
            apply();
        }));
    }

    /** Match the WebView's bottom margin (Capacitor insets the web view above the nav bar). */
    private void alignToWeb(View web) {
        if (adView == null) return;
        if (!(web.getLayoutParams() instanceof ViewGroup.MarginLayoutParams webLp)) return;
        if (!(adView.getLayoutParams() instanceof FrameLayout.LayoutParams lp)) return;
        if (lp.bottomMargin == webLp.bottomMargin) return;
        lp.bottomMargin = webLp.bottomMargin;
        adView.setLayoutParams(lp);
    }

    @PluginMethod
    public void setVisible(PluginCall call) {
        wantVisible = Boolean.TRUE.equals(call.getBoolean("visible", false));
        var activity = getActivity();
        if (activity == null) {
            call.resolve();
            return;
        }
        activity.runOnUiThread(() -> {
            apply();
            call.resolve();
        });
    }

    private void apply() {
        if (adView == null) return;
        if (wantVisible) {
            adView.setVisibility(View.VISIBLE);
            if (requested) adView.resume();
            if (sdkReady && !requested) {
                requested = true;
                adView.loadAd(new AdRequest.Builder().build());
            }
        } else {
            adView.setVisibility(View.GONE);
            if (requested) adView.pause();
        }
    }

    @Override
    protected void handleOnPause() {
        if (adView != null && requested) adView.pause();
    }

    @Override
    protected void handleOnResume() {
        if (adView != null && wantVisible && requested) adView.resume();
    }

    @Override
    protected void handleOnDestroy() {
        if (adView != null) adView.destroy();
        adView = null;
    }
}
