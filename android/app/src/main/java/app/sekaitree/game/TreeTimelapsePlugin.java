package app.sekaitree.game;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Rect;
import android.media.MediaCodec;
import android.media.MediaCodecInfo;
import android.media.MediaFormat;
import android.media.MediaMuxer;
import android.util.Base64;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.nio.ByteBuffer;

/** 1.4.67: stitch JPEG frames (data-URL or raw base64) into H.264 MP4. */
@CapacitorPlugin(name = "TreeTimelapse")
public class TreeTimelapsePlugin extends Plugin {

    @PluginMethod
    public void encode(PluginCall call) {
        JSArray frames = call.getArray("frames");
        int holdMs = Math.max(100, call.getInt("holdMs", 450));
        if (frames == null || frames.length() == 0) {
            call.reject("no frames");
            return;
        }
        new Thread(() -> {
            try {
                File out = encodeMp4(frames, holdMs);
                JSObject ret = new JSObject();
                ret.put("uri", "file://" + out.getAbsolutePath());
                ret.put("path", out.getAbsolutePath());
                call.resolve(ret);
            } catch (Exception e) {
                call.reject(e.getMessage() == null ? "encode failed" : e.getMessage());
            }
        }, "tree-timelapse").start();
    }

    private File encodeMp4(JSArray frames, int holdMs) throws Exception {
        int n = frames.length();
        Bitmap first = decodeFrame(frames.getString(0));
        int width = even(Math.max(2, first.getWidth()));
        int height = even(Math.max(2, first.getHeight()));
        first.recycle();

        File out = new File(getContext().getCacheDir(), "sekai-tree-timelapse-" + System.currentTimeMillis() + ".mp4");
        int fps = Math.max(1, Math.round(1000f / holdMs));
        long frameUs = 1_000_000L / fps;

        MediaFormat format = MediaFormat.createVideoFormat("video/avc", width, height);
        format.setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420SemiPlanar);
        format.setInteger(MediaFormat.KEY_BIT_RATE, 1_200_000);
        format.setInteger(MediaFormat.KEY_FRAME_RATE, fps);
        format.setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 1);

        MediaCodec codec = MediaCodec.createEncoderByType("video/avc");
        codec.configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE);
        codec.start();

        MediaMuxer muxer = new MediaMuxer(out.getAbsolutePath(), MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4);
        int track = -1;
        boolean muxStarted = false;
        MediaCodec.BufferInfo info = new MediaCodec.BufferInfo();
        long ptsUs = 0;

        for (int i = 0; i < n; i++) {
            Bitmap raw = decodeFrame(frames.getString(i));
            Bitmap bmp = scaleEven(raw, width, height);
            if (bmp != raw) raw.recycle();
            byte[] yuv = argbToNv12(bmp, width, height);
            bmp.recycle();

            boolean fed = false;
            while (!fed) {
                int inIx = codec.dequeueInputBuffer(50_000);
                if (inIx >= 0) {
                    ByteBuffer inBuf = codec.getInputBuffer(inIx);
                    inBuf.clear();
                    inBuf.put(yuv);
                    codec.queueInputBuffer(inIx, 0, yuv.length, ptsUs, i == 0 ? MediaCodec.BUFFER_FLAG_KEY_FRAME : 0);
                    ptsUs += frameUs;
                    fed = true;
                }
                int[] st = drain(codec, muxer, info, track, muxStarted);
                track = st[0];
                muxStarted = st[1] == 1;
            }
        }

        // signal end of stream
        boolean eosQueued = false;
        while (!eosQueued) {
            int inIx = codec.dequeueInputBuffer(50_000);
            if (inIx >= 0) {
                codec.queueInputBuffer(inIx, 0, 0, ptsUs, MediaCodec.BUFFER_FLAG_END_OF_STREAM);
                eosQueued = true;
            }
            int[] st = drain(codec, muxer, info, track, muxStarted);
            track = st[0];
            muxStarted = st[1] == 1;
        }
        boolean done = false;
        while (!done) {
            int[] st = drain(codec, muxer, info, track, muxStarted);
            track = st[0];
            muxStarted = st[1] == 1;
            done = st[2] == 1;
        }

        codec.stop();
        codec.release();
        if (muxStarted) muxer.stop();
        muxer.release();
        if (!out.exists() || out.length() < 256) throw new Exception("empty mp4");
        return out;
    }

    /** returns {track, muxStarted(0/1), eos(0/1)} */
    private int[] drain(MediaCodec codec, MediaMuxer muxer, MediaCodec.BufferInfo info, int track, boolean muxStarted) {
        int eos = 0;
        while (true) {
            int outIx = codec.dequeueOutputBuffer(info, 10_000);
            if (outIx == MediaCodec.INFO_TRY_AGAIN_LATER) break;
            if (outIx == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
                if (!muxStarted) {
                    track = muxer.addTrack(codec.getOutputFormat());
                    muxer.start();
                    muxStarted = true;
                }
                continue;
            }
            if (outIx >= 0) {
                ByteBuffer outBuf = codec.getOutputBuffer(outIx);
                if ((info.flags & MediaCodec.BUFFER_FLAG_CODEC_CONFIG) != 0) {
                    codec.releaseOutputBuffer(outIx, false);
                    continue;
                }
                if (muxStarted && info.size > 0 && outBuf != null) {
                    outBuf.position(info.offset);
                    outBuf.limit(info.offset + info.size);
                    muxer.writeSampleData(track, outBuf, info);
                }
                if ((info.flags & MediaCodec.BUFFER_FLAG_END_OF_STREAM) != 0) eos = 1;
                codec.releaseOutputBuffer(outIx, false);
                if (eos == 1) break;
            } else break;
        }
        return new int[]{track, muxStarted ? 1 : 0, eos};
    }

    private static Bitmap decodeFrame(String dataUrlOrB64) {
        String b64 = dataUrlOrB64;
        int comma = b64.indexOf(',');
        if (b64.startsWith("data:") && comma >= 0) b64 = b64.substring(comma + 1);
        byte[] bytes = Base64.decode(b64, Base64.DEFAULT);
        Bitmap bmp = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
        if (bmp == null) throw new IllegalArgumentException("bad frame");
        return bmp;
    }

    private static int even(int v) { return v & ~1; }

    private static Bitmap scaleEven(Bitmap src, int w, int h) {
        if (src.getWidth() == w && src.getHeight() == h) return src;
        Bitmap out = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888);
        new Canvas(out).drawBitmap(src, null, new Rect(0, 0, w, h), new Paint(Paint.FILTER_BITMAP_FLAG));
        return out;
    }

    private static byte[] argbToNv12(Bitmap bmp, int width, int height) {
        int[] argb = new int[width * height];
        bmp.getPixels(argb, 0, width, 0, 0, width, height);
        byte[] yuv = new byte[width * height * 3 / 2];
        int yIndex = 0;
        int uvIndex = width * height;
        for (int j = 0; j < height; j++) {
            for (int i = 0; i < width; i++) {
                int c = argb[j * width + i];
                int r = (c >> 16) & 0xff;
                int g = (c >> 8) & 0xff;
                int b = c & 0xff;
                int y = ((66 * r + 129 * g + 25 * b + 128) >> 8) + 16;
                yuv[yIndex++] = (byte) Math.max(0, Math.min(255, y));
                if ((j & 1) == 0 && (i & 1) == 0) {
                    int u = ((-38 * r - 74 * g + 112 * b + 128) >> 8) + 128;
                    int v = ((112 * r - 94 * g - 18 * b + 128) >> 8) + 128;
                    yuv[uvIndex++] = (byte) Math.max(0, Math.min(255, u));
                    yuv[uvIndex++] = (byte) Math.max(0, Math.min(255, v));
                }
            }
        }
        return yuv;
    }
}
