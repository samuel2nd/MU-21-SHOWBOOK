/**
 * TSL 5.0 Protocol Packet Builder
 *
 * Matches Companion's packet format for Kaleido layout triggers.
 *
 * Packet structure (12 bytes):
 * | PBC (2 bytes LE) | FLAGS (1) | SCREEN (2 LE) | INDEX (2 LE) | CONTROL (2 LE) | TALLY (2) | LENGTH (1) |
 *
 * For layout triggers:
 * - ON:  CONTROL = 0x000d (bit 0 set)
 * - OFF: CONTROL = 0x000c (bit 0 clear)
 */

const TSL5 = {
  /**
   * Build a TSL 5.0 packet matching Companion's format
   * @param {number} index - Address index for the layout
   * @param {boolean} on - true for ON, false for OFF
   * @returns {Buffer} - Complete TSL 5.0 packet (12 bytes)
   */
  buildPacket(index, on) {
    // Total: PBC(2) + FLAGS(1) + SCREEN(2) + INDEX(2) + CONTROL(2) + TALLY(2) + LENGTH(1) = 12 bytes
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

    // INDEX - Address index (little-endian)
    buffer.writeUInt16LE(index, offset);
    offset += 2;

    // CONTROL - 0x0d for ON (bit 0 set), 0x0c for OFF (bit 0 clear)
    buffer.writeUInt16LE(on ? 0x000d : 0x000c, offset);
    offset += 2;

    // TALLY - 2 bytes of zeros
    buffer.writeUInt16LE(0, offset);
    offset += 2;

    // LENGTH - text length (0)
    buffer.writeUInt8(0, offset);

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
