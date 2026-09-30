package io.github.kahowu24065.treegame;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(TreeBannerPlugin.class);
        super.onCreate(savedInstanceState);
        // Opening the game starts the music bed without a tap.
        WebView webView = getBridge().getWebView();
        if (webView != null) webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
    }
}
