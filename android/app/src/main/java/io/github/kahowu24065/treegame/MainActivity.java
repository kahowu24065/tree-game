package io.github.kahowu24065.treegame;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(TreeBannerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
