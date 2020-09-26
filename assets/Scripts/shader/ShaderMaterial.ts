
const renderEngine = cc.renderer.renderEngine;
const Material = renderEngine.Material;

export default class ShaderMaterial extends Material {
    constructor(name: string, vert?: string, frag?: string, defines?: any[]) {
        super(false);
        let renderer = cc.renderer as any;
        let lib = renderer._forward._programLib;

        //利用了 && 运算符的特性
        !lib._templates[name] && lib.define(name, vert, frag, defines);
        this._init(name);
    }

    private _init(name: string) {
        let renderer = renderEngine.renderer;
        let gfx = renderEngine.gfx;

        let pass = new renderer.Pass(name);
        pass.setDepth(false, false);
        pass.setCullMode(gfx.CULL_NONE);
        pass.setBlend(
            gfx.BLEND_FUNC_ADD,
            gfx.BLEND_SRC_ALPHA, gfx.BLEND_ONE_MINUS_SRC_ALPHA,
            gfx.BLEND_FUNC_ADD,
            gfx.BLEND_SRC_ALPHA, gfx.BLEND_ONE_MINUS_SRC_ALPHA
        );
        
        let mainTech = new renderer.Technique(
            ['transparent'],
            [
                { name: 'texture', type: renderer.PARAM_TEXTURE_2D },
                { name: 'noiseTex', type: renderer.PARAM_TEXTURE_2D},
                { name: 'color', type: renderer.PARAM_COLOR4 },
                { name: 'pos', type: renderer.PARAM_FLOAT3 },
                { name: 'size', type: renderer.PARAM_FLOAT2 },
                { name: 'time', type: renderer.PARAM_FLOAT },
                { name: 'num', type: renderer.PARAM_FLOAT },
                { name: 'texture_texel',type:renderer.PARAM_FLOAT2},
                { name: '_EdgeColor',type: renderer.PARAM_COLOR4},
                { name: '_BackgroundColor',type: renderer.PARAM_COLOR4},
                { name: '_EdgeOnly',type: renderer.PARAM_FLOAT},
                { name: '_EdgeWidth',type: renderer.PARAM_FLOAT},
            ],
            [pass]
        );

        this._texture = null;
        this._color = { r: 1.0, g: 1.0, b: 1.0, a: 1.0 };
        this._pos = { x: 0.0, y: 0.0, z: 0.0 };
        this._size = { x: 0.0, y: 0.0 };
        this._time = 0.0;
        this._num = 0.0;
        this._texture_texel = {x:0.0,y:0.0};
        this._effect = this.effect = new renderer.Effect([mainTech], { 
            'color': this._color,
            'pos': this._pos,
            'size': this._size,
            'time': this._time,
            'num': this._num,
            'texture_texel':this._texture_texel,
            '_EdgeColor':{ x: 0.0, y: 0.0, z: 0.0 ,a:1.0},
            '_BackgroundColor': { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
            '_EdgeOnly':0.0,
            '_EdgeWidth':1.0,
        }, []);
        this._mainTech = mainTech;
    }

    setTexture(texture) {
        this._texture = texture;
        this._texture.update({ flipY: false, mipmap: false });
        this._effect.setProperty('texture', texture.getImpl());
        this._texIds['texture'] = texture.getId();
        this._texture_texel={x:1.0/texture.width,y:1.0/texture.height};
        this._effect.setProperty('texture_texel',this._texture_texel);
    }

    setColor(r, g, b, a) {
        this._color.r = r;
        this._color.g = g;
        this._color.b = b;
        this._color.a = a;
        this._effect.setProperty('color', this._color);
    }

    setPos(x, y, z) {
        this._pos.x = x;
        this._pos.y = y;
        this._pos.z = z;
        this._effect.setProperty('pos', this._pos);
    }

    setSize(x, y) {
        this._size.x = x;
        this._size.y = y;
        this._effect.setProperty('size', this._size);
    }

    setTime(time) {
        this._time = time;
        this._effect.setProperty('time', this._time);
    }

    setNum(num) {
        this._num = num;
        this._effect.setProperty('num', this._num);
    }
    setProp(name,val){
        this._effect.setProperty(name,val);
    }
}