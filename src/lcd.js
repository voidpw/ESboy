import Utils from './utils';

export default class LCD {

  constructor(mmu, ctx, width, height){
    this.mmu = mmu;
    this.ctx = ctx;
    this.width = width;
    this.height = height;

    this.imageData = ctx.createImageData(width, height);

    this.tileWidth = 8;
    this.tileHeight = this.tileWidth;
  }

  drawTiles(){
    for(let x = 0; x < 0x14; x++){
      for(let y = 0; y < 0x12; y++){
        this.drawTile({tile_number: this.mmu.getTileNbAtCoord(x, y), grid_x: x, grid_y: y});
      }
    }
  }

  /**
   * @param {number} tile_number
   * @param {number} tile_x from 0x00 to 0x1f
   * @param {number} tile_y from 0x00 to 0x1f
   */
  drawTile({tile_number, grid_x, grid_y}){

    const x_start = grid_x * this.tileWidth;
    const y_start = grid_y * this.tileHeight;

    let x = x_start;
    let y = y_start;

    const tileBuffer = this.mmu.readTile(tile_number);
    const array = LCD.tileToMatrix(tileBuffer);

    for(let i = 0; i < array.length; i++){
      if (i > 0 && i % this.tileWidth === 0){
        x = x_start;
        y++;
      }
      this.drawPixel(x++, y, array[i]);
    }
    ctx.putImageData(this.imageData, 0, 0);
  }

  static tileToMatrix(buffer){
    const array = [];
    for(let i = 0; i < 16; i++){
      
      const msb = Utils.toBin8(buffer.readUInt8(i++));
      const lsb = Utils.toBin8(buffer.readUInt8(i));

      for(let b = 0; b < 8; b++){
        array.push( (parseInt(msb[b], 2) << 1) + parseInt(lsb[b], 2));
      }
    }
    return array; // TODO: cache array for speed
  }

  drawPixel(x, y, level) {
    var index = (x + y * this.width) * 4;
    if (level === 1){
      this.imageData.data[index + 0] = 0;
      this.imageData.data[index + 1] = 0;
      this.imageData.data[index + 2] = 0;
      this.imageData.data[index + 3] = 255;
    }
  }
}