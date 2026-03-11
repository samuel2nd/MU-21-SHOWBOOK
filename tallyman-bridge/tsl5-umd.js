/**
 * TSL 5.0 UMD Protocol Implementation
 *
 * Builds DMSG (Display Message) packets for Tallyman UMD displays.
 * Based on TSL UMD Protocol 5.0 specification.
 */

const TSL5_UMD = {
  /**
   * Build a TSL 5.0 DMSG packet for UMD text
   * @param {number} index - Display index (1-based)
   * @param {string} text - Text to display (max 16 chars typical)
   * @param {number} screen - Screen number (default 0)
   * @returns {Buffer} - UDP packet ready to send
   */
  buildUmdText(index, text, screen = 0) {
    // TSL 5.0 DMSG structure:
    // PBC (2 bytes) - Packet Byte Count (little-endian, excludes PBC itself)
    // VER (1 byte) - Version (0x00 for TSL 5.0)
    // FLAGS (1 byte) - Flags (0x00)
    // SCREEN (2 bytes) - Screen number (little-endian)
    // INDEX (2 bytes) - Display index (little-endian)
    // CONTROL (2 bytes) - Control data length + tally flags
    // Then DMSG payload:
    //   CONTROL (2 bytes) - 0x0000
    //   LENGTH (2 bytes) - Text length (little-endian)
    //   TEXT (variable) - UTF-8 text

    const textBuffer = Buffer.from(text || '', 'utf8');
    const textLen = textBuffer.length;

    // DMSG payload: control(2) + length(2) + text
    const dmsgPayloadLen = 2 + 2 + textLen;

    // Total packet (after PBC): ver(1) + flags(1) + screen(2) + index(2) + control(2) + dmsg
    const packetLen = 1 + 1 + 2 + 2 + 2 + dmsgPayloadLen;

    const packet = Buffer.alloc(2 + packetLen);
    let offset = 0;

    // PBC - Packet Byte Count (little-endian, excludes PBC itself)
    packet.writeUInt16LE(packetLen, offset);
    offset += 2;

    // VER - Version
    packet.writeUInt8(0x00, offset);
    offset += 1;

    // FLAGS
    packet.writeUInt8(0x00, offset);
    offset += 1;

    // SCREEN (little-endian)
    packet.writeUInt16LE(screen, offset);
    offset += 2;

    // INDEX (little-endian)
    packet.writeUInt16LE(index, offset);
    offset += 2;

    // CONTROL - Display message type with text flag
    // Bits 0-1: Tally brightness (0=off)
    // Bit 2: Text flag (1=text present)
    packet.writeUInt16LE(0x0004, offset);
    offset += 2;

    // DMSG Control (reserved)
    packet.writeUInt16LE(0x0000, offset);
    offset += 2;

    // Text length (little-endian)
    packet.writeUInt16LE(textLen, offset);
    offset += 2;

    // Text data
    textBuffer.copy(packet, offset);

    return packet;
  },

  /**
   * Build a tally-only packet (no text)
   * @param {number} index - Display index (1-based)
   * @param {number} tally - Tally state (0=off, 1=dim, 2=medium, 3=bright)
   * @param {number} screen - Screen number (default 0)
   * @returns {Buffer} - UDP packet ready to send
   */
  buildTally(index, tally = 0, screen = 0) {
    const packetLen = 1 + 1 + 2 + 2 + 2;
    const packet = Buffer.alloc(2 + packetLen);
    let offset = 0;

    // PBC
    packet.writeUInt16LE(packetLen, offset);
    offset += 2;

    // VER
    packet.writeUInt8(0x00, offset);
    offset += 1;

    // FLAGS
    packet.writeUInt8(0x00, offset);
    offset += 1;

    // SCREEN
    packet.writeUInt16LE(screen, offset);
    offset += 2;

    // INDEX
    packet.writeUInt16LE(index, offset);
    offset += 2;

    // CONTROL - Tally only (bits 0-1)
    packet.writeUInt16LE(tally & 0x03, offset);

    return packet;
  }
};

module.exports = TSL5_UMD;
