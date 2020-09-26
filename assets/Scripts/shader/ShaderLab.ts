
const MVP = `
uniform mat4 viewProj;
attribute vec3 a_position;
attribute vec2 a_uv0;
varying vec2 uv0;
void main () {
    vec4 pos = viewProj * vec4(a_position, 1);
    gl_Position = pos;
    uv0 = a_uv0;
}`;

const ShaderLab = {
    GrayScaling: {
        vert: MVP,
        frag: 
`
uniform sampler2D texture;
uniform vec4 color;
varying vec2 uv0;
void main () {
    vec4 c = color * texture2D(texture, uv0);
    float gray = dot(c.rgb, vec3(0.299 * 0.5, 0.587 * 0.5, 0.114 * 0.5));
    gl_FragColor = vec4(gray, gray, gray, c.a * 0.5);
}
`
    },
    Stone: {
        vert: MVP,
        frag: 
`
uniform sampler2D texture;
uniform vec4 color;
varying vec2 uv0;
void main () {
    vec4 c = color * texture2D(texture, uv0);
    float clrbright = (c.r + c.g + c.b) * (1. / 3.);
    float gray = (0.6) * clrbright;
    gl_FragColor = vec4(gray, gray, gray, c.a);
}
`
    },
    Ice: {
        vert: MVP,
        frag: 
`
uniform sampler2D texture;
uniform vec4 color;
varying vec2 uv0;
void main () {
    vec4 clrx = color * texture2D(texture, uv0);
    float brightness = (clrx.r + clrx.g + clrx.b) * (1. / 3.);
	float gray = (1.5)*brightness;
	clrx = vec4(gray, gray, gray, clrx.a)*vec4(0.8,1.2,1.5,1);
    gl_FragColor =clrx;
}
`
    },
    Frozen: {
        vert: MVP,
        frag: 
`
uniform sampler2D texture;
uniform vec4 color;
varying vec2 uv0;
void main () {
    vec4 c = color * texture2D(texture, uv0);
    c *= vec4(0.8, 1, 0.8, 1);
	c.b += c.a * 0.2;
    gl_FragColor = c;
}
`
    },
    Mirror: {
        vert: MVP,
        frag: 
`
uniform sampler2D texture;
uniform vec4 color;
varying vec2 uv0;
void main () {
    vec4 c = color * texture2D(texture, uv0);
    c.r *= 0.5;
    c.g *= 0.8;
    c.b += c.a * 0.2;
    gl_FragColor = c;
}
`
    },
    Poison: {
        vert: MVP,
        frag: 
`
uniform sampler2D texture;
uniform vec4 color;
varying vec2 uv0;
void main () {
    vec4 c = color * texture2D(texture, uv0);
    c.r *= 0.8;
	c.r += 0.08 * c.a;
	c.g *= 0.8;
    c.g += 0.2 * c.a;
	c.b *= 0.8;
    gl_FragColor = c;
}
`
    },
    Banish: {
        vert: MVP,
        frag: 
`
uniform sampler2D texture;
uniform vec4 color;
varying vec2 uv0;
void main () {
    vec4 c = color * texture2D(texture, uv0);
    float gg = (c.r + c.g + c.b) * (1.0 / 3.0);
    c.r = gg * 0.9;
    c.g = gg * 1.2;
    c.b = gg * 0.8;
    c.a *= (gg + 0.1);
    gl_FragColor = c;
}
`
    },
    Vanish: {
        vert: MVP,
        frag: 
`
uniform sampler2D texture;
uniform vec4 color;
varying vec2 uv0;
void main () {
    vec4 c = color * texture2D(texture, uv0);
    float gray = (c.r + c.g + c.b) * (1. / 3.);
    float rgb = gray * 0.8;
    gl_FragColor = vec4(rgb, rgb, rgb, c.a * (gray + 0.1));
}
`
    },
    Invisible: {
        vert: MVP,
        frag: 
`
void main () {
    gl_FragColor = vec4(0,0,0,0);
}
`
    },
    Blur: {
        vert: MVP,
        frag: 
`
precision highp float;
uniform sampler2D texture;
uniform vec4 color;
uniform float num;
uniform vec2 texture_texel;
varying vec2 uv0;
void main () {
    vec4 sum = vec4(0.0);
    vec2 size = vec2(2.0,2.0);
    //sum += texture2D(texture, uv0 - 0.4 * size) * 0.05;
	//sum += texture2D(texture, uv0 - 0.3 * size) * 0.09;
	sum += texture2D(texture, uv0 - texture_texel*2.0 * size) * 0.0545;
	sum += texture2D(texture, uv0 - texture_texel * size) * 0.2442;
	sum += texture2D(texture, uv0             ) * 0.4026;
	sum += texture2D(texture, uv0 + texture_texel * size) * 0.2442;
	sum += texture2D(texture, uv0 +  texture_texel*2.0*size) * 0.0545;
	//sum += texture2D(texture, uv0 + 0.3 * size) * 0.09;
    //sum += texture2D(texture, uv0 + 0.4 * size) * 0.05;
    
    vec4 vectemp = vec4(0,0,0,0);
    vec4 substract = vec4(0,0,0,0);
    vectemp = (sum - substract) * color;

    float alpha = texture2D(texture, uv0).a;
    if(alpha < 0.05) { gl_FragColor = vec4(0 , 0 , 0 , 0); }
	else { gl_FragColor = vectemp; }
}
`
    },
    GaussBlur: {
        vert: MVP,
        frag: 
`
#define repeats 5.
uniform sampler2D texture;
uniform vec4 color;
uniform float num;
varying vec2 uv0;

vec4 draw(vec2 uv) {
    return color * texture2D(texture,uv).rgba; 
}
float grid(float var, float size) {
    return floor(var*size)/size;
}
float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
void main()
{
    vec4 blurred_image = vec4(0.);
    for (float i = 0.; i < repeats; i++) { 
        vec2 q = vec2(cos(degrees((i/repeats)*360.)),sin(degrees((i/repeats)*360.))) * (rand(vec2(i,uv0.x+uv0.y))+num); 
        vec2 uv2 = uv0+(q*num);
        blurred_image += draw(uv2)/2.;
        q = vec2(cos(degrees((i/repeats)*360.)),sin(degrees((i/repeats)*360.))) * (rand(vec2(i+2.,uv0.x+uv0.y+24.))+num); 
        uv2 = uv0+(q*num);
        blurred_image += draw(uv2)/2.;
    }
    blurred_image /= repeats;
    gl_FragColor = vec4(blurred_image);
}
`
    },
    Dissolve: {
        vert: MVP,
        frag: 
`
uniform sampler2D texture;
uniform vec4 color;
uniform float time;
varying vec2 uv0;

void main()
{
    vec4 c = color * texture2D(texture,uv0);
    float height = c.r;
    if(height < time)
    {
        discard;
    }
    if(height < time+0.04)
    {
        // 溶解颜色，可以自定义
        c = vec4(.9,.6,0.3,c.a);
    }
    gl_FragColor = c;
}
`
    },
    Fluxay: {
        vert: MVP,
        frag: 
`
uniform sampler2D texture;
uniform vec4 color;
uniform float time;
varying vec2 uv0;

void main()
{
    vec4 src_color = color * texture2D(texture, uv0).rgba;

    float width = 0.08;       //流光的宽度范围 (调整该值改变流光的宽度)
    float start = tan(time/1.414);  //流光的起始x坐标
    float strength = 0.008;   //流光增亮强度   (调整该值改变流光的增亮强度)
    float offset = 0.5;      //偏移值         (调整该值改变流光的倾斜程度)
    if(uv0.x < (start - offset * uv0.y) &&  uv0.x > (start - offset * uv0.y - width))
    {
        vec3 improve = strength * vec3(255, 255, 255);
        vec3 result = improve * vec3( src_color.r, src_color.g, src_color.b);
        gl_FragColor = vec4(result, src_color.a);

    }else{
        gl_FragColor = src_color;
    }
}
`
    },
    FluxaySuper: {
        vert: MVP,
        frag: 
`
#define TAU 6.12
#define MAX_ITER 5
uniform sampler2D texture;
uniform vec4 color;
uniform float time;
varying vec2 uv0;

void main()
{
    float time = time * .5+5.;
    // uv should be the 0-1 uv of texture...
    vec2 uv = uv0;//fragCoord.xy / iResolution.xy;
    
    vec2 p = mod(uv*TAU, TAU)-250.0;

    vec2 i = vec2(p);
    float c = 1.0;
    float inten = .0045;

    for (int n = 0; n < MAX_ITER; n++) 
    {
        float t =  time * (1.0 - (3.5 / float(n+1)));
        i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(1.5*t + i.x));
        c += 1.0/length(vec2(p.x / (cos(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));
    }
    c /= float(MAX_ITER);
    c = 1.17-pow(c, 1.4);
    vec4 tex = texture2D(texture,uv);
    vec3 colour = vec3(pow(abs(c), 20.0));
    colour = clamp(colour + vec3(0.0, 0.0, .0), 0.0, tex.a);

    // 混合波光
    float alpha = c*tex[3];  
    tex[0] = tex[0] + colour[0]*alpha; 
    tex[1] = tex[1] + colour[1]*alpha; 
    tex[2] = tex[2] + colour[2]*alpha; 
    gl_FragColor = color * tex;
}
`
    },
    OutLineSobel:{
        vert:
`
precision highp float;
precision mediump float;
uniform mat4 viewProj;
uniform vec2 texture_texel;
uniform float _EdgeWidth;
attribute vec3 a_position;
attribute vec2 a_uv0;
varying vec2 uvs[9];
void main () {
    vec4 pos = viewProj * vec4(a_position, 1);
    gl_Position = pos;
    uvs[0] = a_uv0 + texture_texel * vec2(-1, 1)*_EdgeWidth;
    uvs[1] = a_uv0 + texture_texel * vec2(0, 1)*_EdgeWidth;
    uvs[2] = a_uv0 + texture_texel * vec2(1, 1)*_EdgeWidth;
    uvs[3] = a_uv0 + texture_texel * vec2(-1, 0)*_EdgeWidth;
    uvs[4] = a_uv0 + texture_texel * vec2(0, 0)*_EdgeWidth;
    uvs[5] = a_uv0 + texture_texel * vec2(1, 0)*_EdgeWidth;
    uvs[6] = a_uv0 + texture_texel * vec2(-1, -1)*_EdgeWidth;
    uvs[7] = a_uv0 + texture_texel * vec2(0, -1)*_EdgeWidth;
    uvs[8] = a_uv0 + texture_texel * vec2(1, -1)*_EdgeWidth;

    
    //vTextureCoord = a_uv0;
}
`
        ,
        frag:
`
precision highp float;
precision mediump float;
uniform sampler2D texture;
uniform sampler2D noiseTex;
uniform vec4 color;
uniform float time;
uniform vec4 _EdgeColor;
uniform vec4 _BackgroundColor;
uniform float _EdgeOnly;
varying vec2 uvs[9];
float contrast = 1.5;

float luminance(vec4 color) {
    return  0.2125 * color.r + 0.7154 * color.g + 0.0721 * color.b; 
}

float Sobel(){
    float texColor;
    float edgeX = 0.0;
    float edgeY = 0.0;
    float color0=luminance(texture2D(texture,uvs[0]));
    float color2=luminance(texture2D(texture,uvs[2]));
    float color6=luminance(texture2D(texture,uvs[6]));
    float color8=luminance(texture2D(texture,uvs[8]));



    edgeX += color0*-1.0;                                       edgeX += color2*1.0;
    edgeX += luminance(texture2D(texture,uvs[3]))*-2.0;         edgeX += luminance(texture2D(texture,uvs[5]))*2.0;
    edgeX += color6*-1.0;                                       edgeX += color8*1.0;

    edgeY += color0*-1.0;    edgeY += luminance(texture2D(texture,uvs[1]))*-2.0; edgeY += color2*-1.0;
    
    edgeY += color6*1.0;     edgeY += luminance(texture2D(texture,uvs[7]))*2.0;  edgeY += color8*1.0;




    //由于 平方开发 开销大 使用 绝对值的和 作为 模量
    float edge = abs(edgeX) + abs(edgeY);
    return edge;
}
void main()
{
    float edge = Sobel();	
    vec4 origiColor = texture2D(texture, uvs[4]);
    vec4 noiseColor = texture2D(noiseTex,uvs[4]);
    if(edge < 0.5&&edge > 0.05){
        edge = luminance(noiseColor)*edge*2.0;
    }
    edge = 1.0 - edge;
    vec4 withEdgeColor = mix(_EdgeColor,origiColor,edge);
    vec4 onlyEdgeColor = mix(_BackgroundColor,vec4(1.0,1.0,1.0,1.0),edge);
    vec4 finalColor = mix(withEdgeColor,onlyEdgeColor,_EdgeOnly);
    vec4 avgColor = vec4(0.5,0.5,0.5,1.0);
    finalColor = mix(avgColor, finalColor, contrast);
    gl_FragColor = vec4(finalColor.rgb,1.0);
}

`},

    OutLineRoberts:{
        vert:
`
precision highp float;
uniform mat4 viewProj;
uniform vec2 texture_texel;
uniform float _EdgeWidth;
attribute vec3 a_position;
attribute vec2 a_uv0;
varying vec2 uvs[5];
void main () {
    vec4 pos = viewProj * vec4(a_position, 1);
    gl_Position = pos;
    vec2 texelOff = _EdgeWidth * texture_texel;
    uvs[0] = a_uv0;
    uvs[1] = a_uv0 + texelOff * vec2(1,1);
    uvs[2] = a_uv0 + texelOff * vec2(1,-1);
    uvs[3] = a_uv0 + texelOff * vec2(-1,1);
    uvs[4] = a_uv0 + texelOff * vec2(-1,-1);
}
`
,
        frag:
`
precision highp float;
uniform sampler2D texture;
uniform sampler2D noiseTex;
uniform vec2 texture_texel;
uniform vec4 _EdgeColor;
uniform vec4 _BackgroundColor;
uniform float _EdgeOnly;
varying vec2 uvs[5];
float _Sensitive = 12.0;
float contrast = 1.5; 

float luminance(vec3 color) {
    return  0.2125 * color.r + 0.7154 * color.g + 0.0721 * color.b; 
}

void main(){
    float n = texture2D(noiseTex,uvs[0]).r;
    // vec3 col0 = texture2D(texture, uvs[1]).xyz;
    // vec3 col1 = texture2D(texture, uvs[2]).xyz;
    // vec3 col2 = texture2D(texture, uvs[3]).xyz;
    // vec3 col3 = texture2D(texture, uvs[4]).xyz;
    // vec3 r1 = col0 - col3;
    // vec3 r2 = col1 - col2;
    float col0 = luminance(texture2D(texture, uvs[1]).xyz);
    float col1 = luminance(texture2D(texture, uvs[2]).xyz);
    float col2 = luminance(texture2D(texture, uvs[3]).xyz);
    float col3 = luminance(texture2D(texture, uvs[4]).xyz);
    float r1 = col0 - col1;
    float r2 = col1 - col2;
    
    float edge = 1.0 - abs(r1) - abs(r2);
    //float edge = luminance(vec3(pow(r1.r, 2.0),pow(r1.g, 2.0),pow(r1.b, 2.0)) +
                           //vec3(pow(r2.r, 2.0),pow(r2.g, 2.0),pow(r2.b, 2.0)));
    // float edge = luminance(vec3(r1.r*r1.r,r1.g*r1.g,r1.b*r1.b) + vec3(r2.r*r2.r,r2.g*r2.g,r2.b*r2.b));

    // edge = pow(edge, 0.2);
    // if (edge<_Sensitive)
    // {
    //     edge = 0.0;
    // }
    // else
    // {
    //     edge = n;
    // }

    // vec4 color = texture2D(texture, uvs[0]);
    // vec4 finalColor =(1.0 - edge)*color*(0.95+0.1*n);
    // vec4 avgColor = vec4(0.5,0.5,0.5,1.0);
    // finalColor = mix(avgColor, finalColor, contrast);

    // gl_FragColor = vec4(finalColor.rgb,1.0);

    vec4 origiColor = texture2D(texture, uvs[0]);
    vec4 withEdgeColor = mix(_EdgeColor,origiColor,edge);
    vec4 onlyEdgeColor = mix(_BackgroundColor,vec4(1.0,1.0,1.0,1.0),edge);
    gl_FragColor = mix(withEdgeColor,onlyEdgeColor,_EdgeOnly);
}

`

    },


    PaintFliter:{
        vert:
        
`
precision highp float;
uniform mat4 viewProj;
uniform vec2 texture_texel;
attribute vec3 a_position;
attribute vec2 a_uv0;
const int _PaintFactor = 1;
const int indexes = (_PaintFactor+1)*(_PaintFactor+1);
varying vec2 uvs[indexes*2-1];
void main () {
    vec4 pos = viewProj * vec4(a_position, 1);
    gl_Position = pos;

    for (int j = 0; j <= _PaintFactor; ++j)
    {
        for (int k = 0; k <= _PaintFactor; ++k)
        {
            uvs[(indexes-1)+j*_PaintFactor+k] = a_uv0 + texture_texel * vec2(k-_PaintFactor, j-_PaintFactor);
        }
    }
    
    for (int j = 0; j <= _PaintFactor; ++j)
    {
        for (int k = 0; k <= _PaintFactor; ++k)
        {
            uvs[j*_PaintFactor+k] = a_uv0 + texture_texel * vec2(k, j);
        }
    }


}
`
,
        frag:




`
precision highp float;
uniform sampler2D texture;
uniform vec2 texture_texel;

const int _PaintFactor = 1;
const int indexes = (_PaintFactor+1)*(_PaintFactor+1);
varying vec2 uvs[indexes*2-1];

void main(){
    vec3 oriC = texture2D(texture, uvs[0]).xyz;

    vec3 m0 = oriC;
    vec3 m1 = oriC;
    vec3 s0 = oriC*oriC;
    vec3 s1 = oriC*oriC;

    vec3 c = vec3(0.0);
    int r=(_PaintFactor + 1)*(_PaintFactor + 1);
    // for (int j = -_PaintFactor; j <= 0; ++j)
    // {
    //     for (int k = -_PaintFactor; k <= 0; ++k)
    //     {
    //         c = texture2D(texture, uv0 + texture_texel * vec2(k, j)).xyz;
    //         m0 += c;
    //         s0 += c * c;
    //     }
    // }
    // for (int j = 0; j <= _PaintFactor; ++j)
    // {
    //     for (int k = 0; k <= _PaintFactor; ++k)
    //     {
    //         c = texture2D(texture, uv0 + texture_texel * vec2(k, j)).xyz;
    //         m1 += c;
    //         s1 += c * c;
    //     }
    // }


    for(int i=1;i<=indexes-1;i++){
        c = texture2D(texture, uvs[i]).xyz;
        m1 += c;
        s1 += c * c;
    }
    for(int i = indexes ;i<=indexes*2-1;i++){
        c = texture2D(texture, uvs[i]).xyz;
        m0 += c;
        s0 += c * c;
    }

    vec4 finalFragColor = vec4(0.0);
    float min_sigma2 = 1e+2;
    m0 /= float(r);
    s0 = abs(s0 /float(r) - m0 * m0);
    float sigma2 = s0.r + s0.g + s0.b;
    if (sigma2 < min_sigma2)
    {
        min_sigma2 = sigma2;
        finalFragColor = vec4(m0, 1.0);
    }
    m1 /= float(r);
    s1 = abs(s1 / float(r) - m1 * m1);
    sigma2 = s1.r + s1.g + s1.b;
    if (sigma2 < min_sigma2)
    {
        min_sigma2 = sigma2;
        finalFragColor = vec4(m1, 1.0);
    }
    gl_FragColor = finalFragColor;
}

`,

    }
};

export default ShaderLab;
