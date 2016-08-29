import assert from 'assert';
import LCD from '../src/lcd';
import MMU from '../src/mmu';
import ContextMock from './mock/contextMock';
import MMUMock from './mock/mmuMock';
import {describe, beforeEach, it} from 'mocha';

describe('LCD', () => {

  let lcd;
  const WIDTH = 160;
  const HEIGHT = 144;
  const VBLANK = 10;

  beforeEach(function() {
    lcd = new LCD(new MMUMock(), new ContextMock(), WIDTH, HEIGHT);
  });

  it('should clear the LCD', () => {

    lcd.clear();

    for(let i = 0; i < WIDTH * HEIGHT * 4; i++) {
      assert.equal(lcd.imageData.data[i], 0);
    }

  });

  it('should transform a Nintendo tile buffer into a matrix', () => {
    const array = LCD.tileToMatrix(new Buffer('3c004200b900a500b900a50042003c00', 'hex'));
    assert.deepEqual(array, [0,0,2,2,2,2,0,0,
                             0,2,0,0,0,0,2,0,
                             2,0,2,2,2,0,0,2,
                             2,0,2,0,0,2,0,2,
                             2,0,2,2,2,0,0,2,
                             2,0,2,0,0,2,0,2,
                             0,2,0,0,0,0,2,0,
                             0,0,2,2,2,2,0,0]);
  });

  it('should transform a tile buffer into levels of gray matrix', () => {
    const array = LCD.tileToMatrix(new Buffer('3355ccaa3355ccaa3355ccaa3355ccaa', 'hex'));
    assert.deepEqual(array, [0,1,2,3,0,1,2,3,
                             3,2,1,0,3,2,1,0,
                             0,1,2,3,0,1,2,3,
                             3,2,1,0,3,2,1,0,
                             0,1,2,3,0,1,2,3,
                             3,2,1,0,3,2,1,0,
                             0,1,2,3,0,1,2,3,
                             3,2,1,0,3,2,1,0]);
  });

  it('should transform a tile buffer into a transparent matrix', () => {
    const array = LCD.tileToMatrix(new Buffer('00000000000000000000000000000000', 'hex'));
    assert.deepEqual(array, [0,0,0,0,0,0,0,0,
                             0,0,0,0,0,0,0,0,
                             0,0,0,0,0,0,0,0,
                             0,0,0,0,0,0,0,0,
                             0,0,0,0,0,0,0,0,
                             0,0,0,0,0,0,0,0,
                             0,0,0,0,0,0,0,0,
                             0,0,0,0,0,0,0,0]);
  });

  it('should transform a tile buffer into a black matrix', () => {
    const array = LCD.tileToMatrix(new Buffer('ffffffffffffffffffffffffffffffff', 'hex'));
    assert.deepEqual(array, [3,3,3,3,3,3,3,3,
                             3,3,3,3,3,3,3,3,
                             3,3,3,3,3,3,3,3,
                             3,3,3,3,3,3,3,3,
                             3,3,3,3,3,3,3,3,
                             3,3,3,3,3,3,3,3,
                             3,3,3,3,3,3,3,3,
                             3,3,3,3,3,3,3,3]);
  });

  it('should write pixel data', () => {

    const lastIndex = WIDTH*HEIGHT*4 - 1;
    const data = lcd.imageData.data;

    lcd.drawPixel(0, 0, 0);
    lcd.drawPixel(1, 0, 1);
    lcd.drawPixel(WIDTH-1, 0, 2);
    lcd.drawPixel(WIDTH-1, HEIGHT-1, 3);

    assert.deepEqual([data[0], data[1], data[2], data[3]], [0, 0, 0, 0]);
    assert.deepEqual([data[4], data[5], data[6], data[7]], [85, 85, 85, 255]);
    assert.deepEqual([data[WIDTH*4-4], data[WIDTH*4-3], data[WIDTH*4-2], data[WIDTH*4-1]], [170, 170, 170, 255]);
    assert.deepEqual([data[lastIndex-3], data[lastIndex-2], data[lastIndex-1], data[lastIndex]], [255, 255, 255, 255]);
  });

  it('should write black tiles on screen', () => {

    const mmuMock = {
        readTile: function(tile_number){
            return new Buffer('ffffffffffffffffffffffffffffffff', 'hex');
        }
    };

    lcd = new LCD(mmuMock, new ContextMock(), WIDTH, HEIGHT);

    lcd.drawTile({tile_number: 1, grid_x: 0, grid_y: 0});
    lcd.drawTile({tile_number: 1, grid_x: 10, grid_y: 9});
    lcd.drawTile({tile_number: 1, grid_x: 19, grid_y: 17});

    lcd.assertBlackTile = assertBlackTile;

    lcd.assertBlackTile(0, 0);
    lcd.assertBlackTile(10, 9);
    lcd.assertBlackTile(19, 17);
  });

  it('should generate vblank interruption', () => {

    let count = 0;
    for(let i = 0; i < HEIGHT + VBLANK; i++){
      
      if (lcd.isVBlank()) {
        count++;
        /*assert.isTrue(lcd.isControlOp());
        assert.equal(lcd.getWindowTileMapSelect(), 0);
        assert.isTrue(lcd.isWindowDisplay());
        assert.equal(lcd.getTileDataSelect(), 1);
        assert.equal(lcd.getTileMapSelect(), 0);
        assert.equal(lcd.getOBJSize(), 0);
        assert.equal(lcd.isOBJDisplay(), 0);
        assert.isFalse(lcd.isBGandWindowDisplay());*/
      }
      lcd._updateLY();
    }

    assert.equal(count, VBLANK, `Vertical blank occurs ${VBLANK} times`);

  });

});

function assertBlackTile(grid_x, grid_y){

  for(let x = grid_x*8; x < (grid_x+1)*8; x++){
    for(let y = grid_y*8; y < (grid_y+1)*8; y++){
       assert.deepEqual(this.getPixelData(x, y), [255, 255, 255, 255], 'pixel is black');
    } 
  }
}