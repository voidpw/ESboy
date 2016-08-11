import Loader from '../src/Loader';
import CPU from '../src/CPU';
import assert from 'assert';

describe('CPU', function() {

  let loader = new Loader();
  loader.load('./roms/tetris.gb');
  let cpu = new CPU(loader);

  it('should fail without loader', () => {
    (function(){
      let cpu = new CPU();
    }).should.throw();
  });

  it('should read the game header', () => {
    assert.equal(cpu.getGameTitle(), 'TETRIS', 'should read title');
    assert.equal(cpu.isGameInColor(), false, 'should not be gb color');
    assert.equal(cpu.isGameSuperGB(), false, 'should not be super GB');
    assert.equal(cpu.getCartridgeType(), 'ROM ONLY');
    assert.equal(cpu.getRomSize(), '32KB');
    assert.equal(cpu.getRAMSize(), 'None');
    assert.equal(cpu.getDestinationCode(), 'Japanese');
  });

  it('should read the nintendo graphic buffer', () => {

    const buf = new Buffer('CEED6666CC0D000B03730083000C000D0008' +
      '111F8889000EDCCC6EE6DDDDD999BBBB67636E0EECCCDDDC999FBBB9333E', 'hex');
    assert(cpu.getNintendoGraphicBuffer().equals(buf), 'Nintendo Graphic Buffer must match.');
  });

  it('should compute the checksum', () => {
    assert(cpu.isChecksumCorrect());
  });

  it('should start with PC, SP and registers at right values', () => {

    assert.equal(cpu.PC, 0x100, 'Program Counter should start at 0x100');
    assert.equal(cpu.nextCommand(), 'NOP', 'Tetris starts with NOP.');

    assert.equal(cpu.AF, 0x0001, 'Register AF must start as 0x0001');
    assert.equal(cpu.F, 0xb0, 'Register F must start as 0xb0');
    assert.equal(cpu.BC, 0x0013, 'Register BC must start as 0x0013');
    assert.equal(cpu.DE, 0x00d8, 'Register DE must start as 0x00d8');
    assert.equal(cpu.HL, 0x014d, 'Register HL must start as 0x014d');
    assert.equal(cpu.SP, 0xfffe, 'Stack Pointer must start as 0xfffe');

    // Starting values at addresses
    assert.equal(cpu.opcodeAt(0xff05), 0x00);
    assert.equal(cpu.opcodeAt(0xff06), 0x00);
    assert.equal(cpu.opcodeAt(0xff07), 0x00);
    assert.equal(cpu.opcodeAt(0xff10), 0x80);
    assert.equal(cpu.opcodeAt(0xff11), 0xbf);
    assert.equal(cpu.opcodeAt(0xff12), 0xf3);
    assert.equal(cpu.opcodeAt(0xff14), 0xbf);
    assert.equal(cpu.opcodeAt(0xff16), 0x3f);
    assert.equal(cpu.opcodeAt(0xff17), 0x00);
    assert.equal(cpu.opcodeAt(0xff19), 0xbf);
    assert.equal(cpu.opcodeAt(0xff1a), 0x7f);
    assert.equal(cpu.opcodeAt(0xff1b), 0xff);
    assert.equal(cpu.opcodeAt(0xff1c), 0x9f);
    assert.equal(cpu.opcodeAt(0xff1e), 0xbf);
    assert.equal(cpu.opcodeAt(0xff20), 0xff);
    assert.equal(cpu.opcodeAt(0xff21), 0x00);
    assert.equal(cpu.opcodeAt(0xff22), 0x00);
    assert.equal(cpu.opcodeAt(0xff23), 0xbf);
    assert.equal(cpu.opcodeAt(0xff24), 0x77);
    assert.equal(cpu.opcodeAt(0xff25), 0xf3);
    assert.equal(cpu.opcodeAt(0xff26), 0xf1);
    assert.equal(cpu.opcodeAt(0xff40), 0x91);
    assert.equal(cpu.opcodeAt(0xff42), 0x00);
    assert.equal(cpu.opcodeAt(0xff43), 0x00);
    assert.equal(cpu.opcodeAt(0xff45), 0x00);
    assert.equal(cpu.opcodeAt(0xff47), 0xfc);
    assert.equal(cpu.opcodeAt(0xff48), 0xff);
    assert.equal(cpu.opcodeAt(0xff49), 0xff);
    assert.equal(cpu.opcodeAt(0xff4a), 0x00);
    assert.equal(cpu.opcodeAt(0xff4b), 0x00);
    assert.equal(cpu.opcodeAt(0xffff), 0x00);

  });

});