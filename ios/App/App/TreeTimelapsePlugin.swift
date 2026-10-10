import Foundation
import Capacitor
import AVFoundation
import UIKit

/// 1.4.67: stitch JPEG frames into a real H.264 MP4 (share / Photos / WhatsApp friendly).
@objc(TreeTimelapsePlugin)
public class TreeTimelapsePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "TreeTimelapsePlugin"
    public let jsName = "TreeTimelapse"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "encode", returnType: CAPPluginReturnPromise)
    ]

    @objc func encode(_ call: CAPPluginCall) {
        guard let frames = call.getArray("frames", String.self), !frames.isEmpty else {
            call.reject("no frames")
            return
        }
        let holdMs = max(100, call.getInt("holdMs") ?? 450)
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                let url = try Self.buildMp4(frames: frames, holdMs: holdMs)
                call.resolve(["uri": url.absoluteString, "path": url.path])
            } catch {
                call.reject(error.localizedDescription)
            }
        }
    }

    private static func buildMp4(frames: [String], holdMs: Int) throws -> URL {
        guard let first = image(from: frames[0]) else { throw EncodeError.badFrame }
        var width = Int(first.size.width.rounded())
        var height = Int(first.size.height.rounded())
        if width % 2 != 0 { width -= 1 }
        if height % 2 != 0 { height -= 1 }
        width = max(2, width)
        height = max(2, height)

        let out = FileManager.default.temporaryDirectory
            .appendingPathComponent("sekai-tree-timelapse-\(Int(Date().timeIntervalSince1970 * 1000)).mp4")
        try? FileManager.default.removeItem(at: out)

        let writer = try AVAssetWriter(outputURL: out, fileType: .mp4)
        let settings: [String: Any] = [
            AVVideoCodecKey: AVVideoCodecType.h264,
            AVVideoWidthKey: width,
            AVVideoHeightKey: height,
            AVVideoCompressionPropertiesKey: [
                AVVideoAverageBitRateKey: 1_200_000,
                AVVideoProfileLevelKey: AVVideoProfileLevelH264BaselineAutoLevel
            ]
        ]
        let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
        input.expectsMediaDataInRealTime = false
        let attrs: [String: Any] = [
            kCVPixelBufferPixelFormatTypeKey as String: Int(kCVPixelFormatType_32ARGB),
            kCVPixelBufferWidthKey as String: width,
            kCVPixelBufferHeightKey as String: height
        ]
        let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: attrs)
        guard writer.canAdd(input) else { throw EncodeError.writer }
        writer.add(input)
        guard writer.startWriting() else { throw EncodeError.writer }
        writer.startSession(atSourceTime: .zero)

        let frameDuration = CMTime(value: CMTimeValue(holdMs), timescale: 1000)
        var present = CMTime.zero

        for frame in frames {
            guard let img = image(from: frame) else { continue }
            while !input.isReadyForMoreMediaData { Thread.sleep(forTimeInterval: 0.01) }
            var buffer: CVPixelBuffer?
            let status = CVPixelBufferCreate(
                kCFAllocatorDefault, width, height,
                kCVPixelFormatType_32ARGB, attrs as CFDictionary, &buffer
            )
            guard status == kCVReturnSuccess, let pb = buffer else { throw EncodeError.buffer }
            draw(img, into: pb, width: width, height: height)
            if !adaptor.append(pb, withPresentationTime: present) {
                throw EncodeError.append
            }
            present = CMTimeAdd(present, frameDuration)
        }

        input.markAsFinished()
        let sem = DispatchSemaphore(value: 0)
        var finishError: Error?
        writer.finishWriting {
            finishError = writer.error
            sem.signal()
        }
        sem.wait()
        if let finishError { throw finishError }
        if writer.status != .completed { throw EncodeError.writer }
        return out
    }

    private static func image(from dataUrlOrB64: String) -> UIImage? {
        var b64 = dataUrlOrB64
        if b64.hasPrefix("data:"), let comma = b64.firstIndex(of: ",") {
            b64 = String(b64[b64.index(after: comma)...])
        }
        guard let data = Data(base64Encoded: b64, options: .ignoreUnknownCharacters) else { return nil }
        return UIImage(data: data)
    }

    private static func draw(_ image: UIImage, into pb: CVPixelBuffer, width: Int, height: Int) {
        CVPixelBufferLockBaseAddress(pb, [])
        defer { CVPixelBufferUnlockBaseAddress(pb, []) }
        guard let ctx = CGContext(
            data: CVPixelBufferGetBaseAddress(pb),
            width: width,
            height: height,
            bitsPerComponent: 8,
            bytesPerRow: CVPixelBufferGetBytesPerRow(pb),
            space: CGColorSpaceCreateDeviceRGB(),
            bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
        ), let cg = image.cgImage else { return }
        ctx.clear(CGRect(x: 0, y: 0, width: width, height: height))
        ctx.translateBy(x: 0, y: CGFloat(height))
        ctx.scaleBy(x: 1, y: -1)
        ctx.draw(cg, in: CGRect(x: 0, y: 0, width: width, height: height))
    }

    private enum EncodeError: LocalizedError {
        case badFrame, writer, buffer, append
        var errorDescription: String? {
            switch self {
            case .badFrame: return "bad frame"
            case .writer: return "writer failed"
            case .buffer: return "pixel buffer"
            case .append: return "append failed"
            }
        }
    }
}
