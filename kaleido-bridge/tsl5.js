/**
 * TSL 5.0 Protocol Packet Builder
 *
 * Matches Companion's exact packet format for Kaleido layout triggers.
 *
 * Companion packet structure (12 bytes):
 * | PBC (2 bytes LE) | FLAGS (1) | SCREEN (2) | PAD (1) | INDEX (2 LE) | CONTROL (2) | TAIL (2) |
 *
 * For layout triggers:
 * - ON:  CONTROL = 0xd0 (high nibble)
 * - OFF: CONTROL = 0xc0 (high nibble)
 */

const TSL5 = {
  /**
   * Build a TSL 5.0 packet matching Companion's exact format
   * @param {number} index - Address index for the layout
   * @param {boolean} on - true for ON, false for OFF
   * @returns {Buffer} - Complete TSL 5.0 packet (12 bytes)
   */
  buildPacket(index, on) {
    // Total: PBC(2) + FLAGS(1) + SCREEN(2) + PAD(1) + INDEX(2) + CONTROL(2) + TAIL(2) = 12 bytes
    const buffer = Buffer.alloc(12);
    let offset = 0;

    // PBC - Packet Byte Count (10 bytes follow after PBC)
    buffer.writeUInt16LE(10, offset);
    offset += 2;

    // FLAGS - Version and flags (TSL 5.0 = 0x00)
    buffer.writeUInt8(0x00, offset);
    offset += 1;

    // SCREEN - Display/screen address (0)
    buffer.writeUInt16LE(0, offset);
    offset += 2;

    // PAD - Extra padding byte (Companion has this)
    buffer.writeUInt8(0x00, offset);
    offset += 1;

    // INDEX - Address index (little-endian)
    buffer.writeUInt16LE(index, offset);
    offset += 2;

    // CONTROL - 0xd0 for ON, 0xc0 for OFF (high nibble, matching Companion)
    buffer.writeUInt8(on ? 0xd0 : 0xc0, offset);
    offset += 1;

    // Remaining bytes (padding)
    buffer.writeUInt8(0x00, offset);
    offset += 1;
    buffer.writeUInt8(0x00, offset);
    offset += 1;
    buffer.writeUInt8(0x00, offset);

    return buffer;
  },

  /**
   * Build ON packet for layout trigger
   */
  buildLeftTallyOn(index, screen = 0) {
    return this.buildPacket(index, true);
  },

  /**
   * Build OFF packet for layout trigger
   */
  buildLeftTallyOff(index, screen = 0) {
    return this.buildPacket(index, false);
  }
};

module.exports = TSL5;
