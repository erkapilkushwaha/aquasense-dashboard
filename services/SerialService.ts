// services/SerialService.ts

export const SerialService = {
  startConnection: async (callback: (data: string) => void) => {
    try {
      // 1. Request port from user
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 9600 });

      const decoder = new TextDecoderStream();
      port.readable.pipeTo(decoder.writable);
      const reader = decoder.readable.getReader();

      console.log("USB Serial Connected!");

      // 2. Read loop
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) callback(value);
      }
    } catch (error) {
      console.error("Web Serial Error:", error);
      alert("USB Connect karne ke liye Chrome browser use karein aur permission dein.");
    }
  },
  stopConnection: () => {
    console.log("Serial Connection Stopped");
  }
};
