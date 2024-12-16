/**
 * This class handles LZW encoding
 * Adapted from Jef Poskanzer's Java port by way of J. M. G. Elliott.
 * @author Kevin Weiner (original Java version - kweiner@fmsware.com)
 * @author Thibault Imbert (AS3 version - bytearray.org)
 * @author Kevin Kwok (JavaScript version - https://github.com/antimatter15/jsgif)
 */

function LZWEncoder(width, height, pixels, colorDepth) {
    var initCodeSize = Math.max(2, colorDepth);

    var EOF = -1;
    var remaining = 0;
    var curPixel = 0;
    var n_bits = 0;
    var maxbits = 12;
    var maxcode = 0;
    var maxmaxcode = 4096;

    var htab = [];
    var codetab = [];
    
    var hsize = 5003;
    var free_ent = 0;
    var clear_flg = false;
    
    var g_init_bits;
    var ClearCode;
    var EOFCode;
    
    var cur_accum = 0;
    var cur_bits = 0;
    
    var masks = [0x0000, 0x0001, 0x0003, 0x0007, 0x000F, 0x001F,
                 0x003F, 0x007F, 0x00FF, 0x01FF, 0x03FF, 0x07FF,
                 0x0FFF, 0x1FFF, 0x3FFF, 0x7FFF, 0xFFFF];

    var a_count;
    var accum = [];

    function char_out(c, outs) {
        accum[a_count++] = c;
        if (a_count >= 254)
            flush_char(outs);
    }

    function cl_block(outs) {
        cl_hash(hsize);
        free_ent = ClearCode + 2;
        clear_flg = true;
        output(ClearCode, outs);
    }

    function cl_hash(hsize) {
        for (var i = 0; i < hsize; ++i)
            htab[i] = -1;
    }

    function compress(init_bits, outs) {
        var fcode;
        var i;
        var c;
        var ent;
        var disp;
        var hsize_reg;
        var hshift;

        g_init_bits = init_bits;
        clear_flg = false;
        n_bits = g_init_bits;
        maxcode = MAXCODE(n_bits);

        ClearCode = 1 << (init_bits - 1);
        EOFCode = ClearCode + 1;
        free_ent = ClearCode + 2;

        a_count = 0;

        ent = nextPixel();

        hshift = 0;
        for (fcode = hsize; fcode < 65536; fcode *= 2)
            ++hshift;
        hshift = 8 - hshift;

        hsize_reg = hsize;
        cl_hash(hsize_reg);

        output(ClearCode, outs);

        outer_loop: while ((c = nextPixel()) != EOF) {
            fcode = (c << maxbits) + ent;
            i = (c << hshift) ^ ent;

            if (htab[i] === fcode) {
                ent = codetab[i];
                continue;
            }

            else if (htab[i] >= 0) {
                disp = hsize_reg - i;
                if (i === 0)
                    disp = 1;
                do {
                    if ((i -= disp) < 0)
                        i += hsize_reg;

                    if (htab[i] === fcode) {
                        ent = codetab[i];
                        continue outer_loop;
                    }
                } while (htab[i] >= 0);
            }

            output(ent, outs);
            ent = c;

            if (free_ent < maxmaxcode) {
                codetab[i] = free_ent++;
                htab[i] = fcode;
            } else {
                cl_block(outs);
            }
        }

        output(ent, outs);
        output(EOFCode, outs);
    }

    function encode(outs) {
        outs.writeByte(initCodeSize);
        remaining = width * height;
        curPixel = 0;
        compress(initCodeSize + 1, outs);
        outs.writeByte(0);
    }

    function flush_char(outs) {
        if (a_count > 0) {
            outs.writeByte(a_count);
            outs.writeBytes(accum, 0, a_count);
            a_count = 0;
        }
    }

    function MAXCODE(n_bits) {
        return (1 << n_bits) - 1;
    }

    function nextPixel() {
        if (remaining === 0) return EOF;
        --remaining;
        var pix = pixels[curPixel++];
        return pix & 0xff;
    }

    function output(code, outs) {
        cur_accum &= masks[cur_bits];

        if (cur_bits > 0)
            cur_accum |= (code << cur_bits);
        else
            cur_accum = code;

        cur_bits += n_bits;

        while (cur_bits >= 8) {
            char_out((cur_accum & 0xff), outs);
            cur_accum >>= 8;
            cur_bits -= 8;
        }

        if (free_ent > maxcode || clear_flg) {
            if (clear_flg) {
                maxcode = MAXCODE(n_bits = g_init_bits);
                clear_flg = false;
            } else {
                ++n_bits;
                if (n_bits == maxbits)
                    maxcode = maxmaxcode;
                else
                    maxcode = MAXCODE(n_bits);
            }
        }

        if (code == EOFCode) {
            while (cur_bits > 0) {
                char_out((cur_accum & 0xff), outs);
                cur_accum >>= 8;
                cur_bits -= 8;
            }
            flush_char(outs);
        }
    }

    this.encode = encode;
}