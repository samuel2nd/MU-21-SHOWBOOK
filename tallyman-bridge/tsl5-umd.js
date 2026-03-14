/**
 * TSL 5.0 Protocol - UMD Text Message Builder
 *
 * Sends Display Messages (DMSG) to Tallyman for UMD text updates.
 *
 * TSL 5.0 DMSG packet structure:
 * | PBC (2) | VER (1) | FLAGS (1) | SCREEN (2) | INDEX (2) | CONTROL (2) | LENGTH (2) | TEXT (var) |
 *
 * - PBC: Packet Byte Count (little-endian) - bytes following PBC
 * - VER: Version byte (0x00 for TSL 5.0)
 * - FLAGS: Message flags (0x00)
 * - SCREEN: Display screen address (little-endian, default 0)
 * - INDEX: UMD address index (little-endian)
 * - CONTROL: Control/tally data (2 bytes)
 * - LENGTH: Text length (little-endian)
 * - TEXT: UMD text string
 */

const TSL5_UMD = {
  /**
   * Build a TSL 5.0 DMSG packet for UMD text
   * @param {number} index - UMD address index (1-based)
   * @param {string} text - UMD text to display (max ~16 chars typical)
   * @param {number} screen - Screen address (default 0)
   * @param {object} tallies - Optional tally states { rh: bool, txt: bool, lh: bool }
   * @returns {Buffer} - Complete TSL 5.0 DMSG packet
   */
  buildTextPacket(index, text = '', screen = 0, tallies = {}) {
    // Truncate text to reasonable length (16 chars typical for UMDs)
    const textStr = String(text).substring(0, 16);
    const textBuf = Buffer.from(textStr, 'utf8');
    const textLen = textBuf.length;

    // Calculate total packet size
    // PBC(2) + VER(1) + FLAGS(1) + SCREEN(2) + INDEX(2) + CONTROL(2) + LENGTH(2) + TEXT(var)
    const headerSize = 10; // VER + FLAGS + SCREEN + INDEX + CONTROL + LENGTH
    const packetSize = 2 + headerSize + textLen;
    const buffer = Buffer.alloc(packetSize);
    let offset = 0;

    // PBC - Packet Byte Count (bytes following PBC)
    buffer.writeUInt16LE(headerSize + textLen, offset);
    offset += 2;

    // VER - Version (TSL 5.0 = 0x00)
    buffer.writeUInt8(0x00, offset);
    offset += 1;

    // FLAGS - Message flags
    buffer.writeUInt8(0x00, offset);
    offset += 1;

    // SCREEN - Display screen address (little-endian)
    buffer.writeUInt16LE(screen, offset);
    offset += 2;

    // INDEX - UMD address index (little-endian)
    buffer.writeUInt16LE(index, offset);
    offset += 2;

    // CONTROL - Tally control data
    // 0xC0 = default "no tally, normal brightness" (matches Companion)
    // Bits 0-1: RH tally, Bits 2-3: Text tally, Bits 4-5: LH tally
    // Bits 6-7: Control/brightness (0xC0 = normal)
    let control = 0xC0;  // Base value matching Companion
    if (tallies.rh) control |= 0x01;  // RH tally on (red)
    if (tallies.txt) control |= 0x04; // Text tally on
    if (tallies.lh) control |= 0x10;  // LH tally on
    buffer.writeUInt16LE(control, offset);
    offset += 2;

    // LENGTH - Text length (little-endian)
    buffer.writeUInt16LE(textLen, offset);
    offset += 2;

    // TEXT - UMD text string
    if (textLen > 0) {
      textBuf.copy(buffer, offset);
    }

    return buffer;
  },

  /**
   * Build a simple UMD text update packet (no tallies)
   */
  buildUmdText(index, text, screen = 0) {
    return this.buildTextPacket(index, text, screen, {});
  },

  /**
   * Build a packet to clear UMD text
   */
  buildClearText(index, screen = 0) {
    return this.buildTextPacket(index, '', screen, {});
  }
};

module.exports = TSL5_UMD;
