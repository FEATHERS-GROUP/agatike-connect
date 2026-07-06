import { Scanner, outline } from "@yudiel/react-qr-scanner";

export default function QRScanner({ onScan }: { onScan: (text: string) => void }) {
  return (
    <Scanner
      onScan={(detected) => {
        if (detected && detected.length > 0 && detected[0].rawValue) {
          onScan(detected[0].rawValue);
        }
      }}
      formats={["qr_code"]}
      components={{
        tracker: outline,
        torch: true,
      }}
      styles={{
        container: { width: "100%", height: "100%", borderRadius: "2.5rem" },
        video: { objectFit: "cover" },
      }}
    />
  );
}
