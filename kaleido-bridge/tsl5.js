/**
 * TSL 5.0 Protocol Packet Builder
 *
 * TSL 5.0 packet structure:
 * | PBC (2 bytes LE) | FLAGS (1 byte) | SCREEN (2 bytes LE) | INDEX (2 bytes LE) | CONTROL (2 bytes LE) | TALLY (1 byte) |
 *
 * For Kaleido layout triggers:
 * - Left Tally ON: CONTROL=0x0004, TALLY=0x04
 * - Left Tally OFF: CONTROL=0x0004, TALLY=0x00
 */

const TSL5 = {
  // Control flags
  CONTROL_TALLY: 0x0004,

  // Tally states
  TALLY_LEFT_ON: 0x04,
  TALLY_OFF: 0x00,

  /**
   * Build a TSL 5.0 packet
   * @param {number} screen - Screen/display number (usually 0)
   * @param {number} index - Address index (1-based for Kaleido layouts)
   * @param {number} control - Control word
   * @param {number} tally - Tally state byte
   * @returns {Buffer} - Complete TSL 5.0 packet
   */
  buildPacket(screen, index, control, tally) {
    // Packet format: PBC (2) + FLAGS (1) + SCREEN (2) + INDEX (2) + CONTROL (2) + TALLY (1) = 10 bytes
    const buffer = Buffer.alloc(10);
    let offset = 0;

    // PBC - Packet Byte Count (length of data after PBC, little-endian)
    // Data length = FLAGS(1) + SCREEN(2) + INDEX(2) + CONTROL(2) + TALLY(1) = 8
    buffer.writeUInt16LE(8, offset);
    offset += 2;

    // FLAGS - Version and flags (TSL 5.0 = 0x00)
    buffer.writeUInt8(0x00, offset);
    offset += 1;

    // SCREEN - Display/screen address (little-endian)
    buffer.writeUInt16LE(screen, offset);
    offset += 2;

    // INDEX - Address index (little-endian)
    buffer.writeUInt16LE(index, offset);
    offset += 2;

    // CONTROL - Control word (little-endian)
    buffer.writeUInt16LE(control, offset);
    offset += 2;

    // TALLY - Tally state
    buffer.writeUInt8(tally, offset);

    return buffer;
  },

  /**
   * Build Left Tally ON packet
   * @param {number} index - Address index for the layout trigger
   * @param {number} screen - Screen number (default 0)
   * @returns {Buffer}
   */
  buildLeftTallyOn(index, screen = 0) {
    return this.buildPacket(screen, index, this.CONTROL_TALLY, this.TALLY_LEFT_ON);
  },

  /**
   * Build Left Tally OFF packet
   * @param {number} index - Address index
   * @param {number} screen - Screen number (default 0)
   * @returns {Buffer}
   */
  buildLeftTallyOff(index, screen = 0) {
    return this.buildPacket(screen, index, this.CONTROL_TALLY, this.TALLY_OFF);
  }
};

module.exports = TSL5;
