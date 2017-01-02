import CPU from '../src/cpu';
import MMU from '../src/mmu';
import Loader from '../src/loader';
import assert from 'assert';
import {describe, before, it} from 'mocha';
import lcdMock from './mock/lcdMock';

let cpu, lcd;

describe('Start BIOS', () => {

  before( () => {
    const loader = new Loader('./roms/blargg_cpu_instrs.gb');
    lcd = new lcdMock();
    cpu = new CPU(new MMU(loader.asUint8Array()), lcd);
  });

  it('should start with pc, sp and registers at right values', () => {
    assert.equal(cpu.pc(), 0x0000, 'Program Counter should start at 0x0000 in BIOS');
    assert.equal(cpu.a(), 0x01, 'Accumulator must start as 0x01 for GB');
    assert.equal(cpu.af(), 0x01b0, 'Register af must start as 0x01bc');
    assert.equal(cpu.f(), 0b1011, 'Flag register must start as 0b1011');
    assert.equal(cpu.bc(), 0x0013, 'Register bc must start as 0x0013');
    assert.equal(cpu.de(), 0x00d8, 'Register de must start as 0x00d8');
    assert.equal(cpu.hl(), 0x014d, 'Register hl must start as 0x014d');
    assert.equal(cpu.sp(), 0xfffe, 'Stack Pointer must start as 0xfffe');
  });

  it('BIOS should reset VRAM', () => {
    cpu.runUntil(0x0028);
    assert.equal(cpu.mmu.readByteAt(0x9fff), 0x00, 'Top VRAM empty');
    assert.equal(cpu.mmu.readByteAt(0x8000), 0x00, 'Bottom VRAM empty');
  });

  it('should not start unsupported roms', () => {
    const mmuMock = {
      getCartridgeType: function () {
        throw Error('Unsupported Cartridge type');
      }
    };

    assert.throws( () => new CPU(mmuMock, new lcdMock()), Error, 'Unsupported Cartridge type');
  });

  describe('LCD', () => {
    it('should draw lines on LCD mode 3', () => {
      let lines = [];
      lcd.drawLine = (line) => {
        lines[line] = true;
      };
      cpu.mmu.writeByteAt(cpu.mmu.ADDR_LCDC, 0x80); // LCD on
      cpu._execute = () => cpu.nop();

      cpu.frame();

      for(let l = 0; l < 144; l++) {
        assert.equal(lines[l], true);
      }
    });
  });

});