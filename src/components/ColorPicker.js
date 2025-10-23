// ColorPicker.js
import React, {useMemo, useRef, useState, useEffect, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  TouchableOpacity,
  TextInput,
} from 'react-native';

/* ===================== Utils ===================== */
const clamp = (v, min=0, max=1) => Math.min(max, Math.max(min, v));

// hsv in [0..360, 0..1, 0..1], a in [0..1]
function hsvToRgb(h, s, v) {
  let c = v * s;
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = v - c;
  let r=0,g=0,b=0;
  if (0 <= h && h < 60) [r,g,b] = [c,x,0];
  else if (60 <= h && h < 120) [r,g,b] = [x,c,0];
  else if (120 <= h && h < 180) [r,g,b] = [0,c,x];
  else if (180 <= h && h < 240) [r,g,b] = [0,x,c];
  else if (240 <= h && h < 300) [r,g,b] = [x,0,c];
  else [r,g,b] = [c,0,x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}
function rgbToHex({r,g,b}) {
  const toHex = (n) => n.toString(16).padStart(2,'0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function hexToRgb(hex) {
  const s = hex.replace('#','').trim();
  if (s.length === 3) {
    const [r,g,b] = s.split('').map(ch => parseInt(ch+ch,16));
    return {r,g,b};
  }
  if (s.length === 6) {
    return {
      r: parseInt(s.slice(0,2),16),
      g: parseInt(s.slice(2,4),16),
      b: parseInt(s.slice(4,6),16)
    };
  }
  return null;
}
function rgbToHsv({r,g,b}) {
  r/=255; g/=255; b/=255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  const d = max - min;
  let h=0;
  if (d === 0) h = 0;
  else if (max === r) h = 60 * (((g-b)/d) % 6);
  else if (max === g) h = 60 * (((b-r)/d) + 2);
  else h = 60 * (((r-g)/d) + 4);
  if (h < 0) h += 360;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return {h,s,v};
}
function withAlphaHex(hex, a) {
  const alpha = Math.round(clamp(a,0,1) * 255);
  return hex + alpha.toString(16).padStart(2,'0');
}

/* Tiny checkerboard (for alpha track) built from views */
const Checker = memo(({size=8}) => {
  const row = useMemo(() => [0,1,2,3].map(i => (
    <View key={i} style={{flexDirection:'row'}}>
      {[0,1,2,3].map(j => {
        const even = (i + j) % 2 === 0;
        return <View key={j} style={{
          width:size, height:size,
          backgroundColor: even ? '#bbb' : '#eee'
        }}/>;
      })}
    </View>
  )), [size]);
  return <View style={{width:size*4,height:size*4}}>{row}</View>;
});

/* ===================== 2D SV Square ===================== */
const SVSquare = memo(function SVSquare({
  hue,
  s,
  v,
  onChange,
  size=220,
  steps=30,      // more steps = smoother
}) {
  const ref = useRef(null);
  const cellW = size/steps;
  const cellH = size/steps;

  // touch handling
  const choose = (x, y) => {
    const sat = clamp(x/size);
    const val = clamp(1 - y/size);
    onChange?.(sat, val);
  };
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e, g) => {
      const {locationX, locationY} = e.nativeEvent;
      choose(locationX, locationY);
    },
    onPanResponderMove: (e, g) => {
      const {locationX, locationY} = e.nativeEvent;
      choose(locationX, locationY);
    },
  })).current;

  // build discrete grid
  const grid = [];
  for (let yi=0; yi<steps; yi++) {
    const row = [];
    for (let xi=0; xi<steps; xi++) {
      const sat = xi/(steps-1);
      const val = 1 - yi/(steps-1);
      const {r,g,b} = hsvToRgb(hue, sat, val);
      row.push(
        <View
          key={`${xi}-${yi}`}
          style={{width:cellW, height:cellH, backgroundColor: `rgb(${r},${g},${b})`}}
        />
      );
    }
    grid.push(<View key={`r${yi}`} style={{flexDirection:'row'}}>{row}</View>);
  }

  return (
    <View style={{width:size, height:size}} {...pan.panHandlers}>
      {grid}
      {/* Thumb */}
      <View pointerEvents="none" style={{
        position:'absolute',
        left: clamp(s,0,1)*size - 10,
        top: (1-clamp(v,0,1))*size - 10,
        width:20, height:20, borderRadius:10,
        borderWidth:2, borderColor:'#fff', backgroundColor:'transparent',
        shadowColor:'#000', shadowOpacity:0.5, shadowRadius:2, elevation:1
      }}/>
    </View>
  );
});

/* ===================== Vertical hue slider ===================== */
const HueSlider = memo(function HueSlider({
  hue,
  onChange,
  height=220,
  width=18,
}) {
  const steps = 72; // 5° per step (smooth enough)
  const barH = height / steps;

  const choose = (y) => {
    const h = clamp(y/height) * 360;
    onChange?.(h);
  };
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => choose(e.nativeEvent.locationY),
    onPanResponderMove:  (e) => choose(e.nativeEvent.locationY),
  })).current;

  const stripes = [];
  for (let i=0;i<steps;i++){
    const h = (i/(steps-1))*360;
    const {r,g,b} = hsvToRgb(h, 1, 1);
    stripes.push(
      <View key={i} style={{height:barH, width, backgroundColor:`rgb(${r},${g},${b})`}}/>
    );
  }

  return (
    <View {...pan.panHandlers} style={{width, height, borderRadius:3, overflow:'hidden'}}>
      {stripes}
      {/* Thumb */}
      <View pointerEvents="none" style={{
        position:'absolute', left:-2,
        top: clamp(hue/360,0,1)*height - 8,
        width: width+4, height: 4, backgroundColor:'#fff',
        borderRadius:2, shadowColor:'#000', shadowOpacity:0.5, shadowRadius:2, elevation:1
      }}/>
    </View>
  );
});

/* ===================== Alpha slider (optional) ===================== */
const AlphaSlider = memo(function AlphaSlider({
  hue,
  alpha,
  onChange,
  height=220,
  width=18,
}) {
  const steps = 40;
  const barH = height / steps;

  const choose = (y) => onChange?.(1 - clamp(y/height));
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => choose(e.nativeEvent.locationY),
    onPanResponderMove:  (e) => choose(e.nativeEvent.locationY),
  })).current;

  const {r,g,b} = hsvToRgb(hue, 1, 1);
  const stripes = [];
  for (let i=0;i<steps;i++){
    const a = 1 - i/(steps-1);
    stripes.push(
      <View key={i} style={{height:barH, width}}>
        <View style={StyleSheet.absoluteFill}>
          <Checker size={4}/>
        </View>
        <View style={[StyleSheet.absoluteFill, {backgroundColor:`rgba(${r},${g},${b},${a})`}]}/>
      </View>
    );
  }

  return (
    <View {...pan.panHandlers} style={{width, height, borderRadius:3, overflow:'hidden'}}>
      {stripes}
      <View pointerEvents="none" style={{
        position:'absolute', left:-2,
        top: (1-clamp(alpha,0,1))*height - 8,
        width: width+4, height:4, backgroundColor:'#fff', borderRadius:2,
        shadowColor:'#000', shadowOpacity:0.5, shadowRadius:2, elevation:1
      }}/>
    </View>
  );
});

/* ===================== Main Picker ===================== */
export default function ColorPicker({
  initialColor = '#0b7285',
  showAlpha = true,
  size = 220,
  onChange,              // ({hex, rgba, hsv}) => void
}) {
  const initRgb = hexToRgb(initialColor.replace(/[^#0-9a-f]/ig,'').slice(0,7)) ?? {r:11,g:114,b:133};
  const init = rgbToHsv(initRgb);
  const [h, setH] = useState(init.h || 190);
  const [s, setS] = useState(init.s ?? 0.7);
  const [v, setV] = useState(init.v ?? 0.7);
  const [a, setA] = useState(1);
  const rgb = useMemo(()=>hsvToRgb(h,s,v), [h,s,v]);
  const hex = useMemo(()=>rgbToHex(rgb), [rgb]);
  const rgbaStr = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a.toFixed(2)})`;

  useEffect(() => {
    onChange?.({
      hex: showAlpha ? withAlphaHex(hex, a) : hex,
      rgba: { ...rgb, a },
      hsv: { h, s, v, a }
    });
  }, [hex, a, h, s, v, onChange, showAlpha]);

  const [hexInput, setHexInput] = useState(hex);
  useEffect(()=> setHexInput(hex), [hex]);

  const applyHexInput = () => {
    const rgbParsed = hexToRgb(hexInput);
    if (!rgbParsed) return;
    const {h:hx, s:sx, v:vx} = rgbToHsv(rgbParsed);
    setH(hx); setS(sx); setV(vx);
  };

  return (
    <View style={styles.wrap}>
      {/* Header with preview + hex */}
      <View style={styles.header}>
        <View style={[styles.preview,{backgroundColor: rgbaStr}]}>
          <Checker size={6}/>
          <View style={[StyleSheet.absoluteFill,{backgroundColor: rgbaStr}]}/>
        </View>
        <Text style={styles.hex}>{showAlpha ? withAlphaHex(hex, a) : hex}</Text>
      </View>

      {/* Picker area */}
      <View style={{flexDirection:'row', gap:12}}>
        <SVSquare
          hue={h} s={s} v={v}
          size={size} steps={32}
          onChange={(sat,val)=>{ setS(sat); setV(val); }}
        />
        <View style={{justifyContent:'space-between'}}>
          <HueSlider hue={h} onChange={setH} height={size}/>
          {showAlpha && <AlphaSlider hue={h} alpha={a} onChange={setA} height={size} />}
        </View>
      </View>

      {/* controls */}
      <View style={styles.row}>
        <Text style={styles.label}>H:</Text><Text style={styles.value}>{Math.round(h)}</Text>
        <Text style={styles.label}>S:</Text><Text style={styles.value}>{Math.round(s*100)}%</Text>
        <Text style={styles.label}>V:</Text><Text style={styles.value}>{Math.round(v*100)}%</Text>
        <Text style={styles.label}>A:</Text><Text style={styles.value}>{Math.round(a*100)}%</Text>
      </View>

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={hexInput}
          onChangeText={setHexInput}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={9}
        />
        <TouchableOpacity style={styles.btn} onPress={applyHexInput}>
          <Text style={styles.btnTxt}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{ padding:14, backgroundColor:'#111', borderRadius:10, width:360, alignSelf:'center' },
  header:{ flexDirection:'row', alignItems:'center', marginBottom:10, gap:10 },
  preview:{
    width:44, height:44, borderRadius:6, overflow:'hidden',
    borderWidth:1, borderColor:'#0006'
  },
  hex:{ color:'#d8f3f3', fontWeight:'600' },
  row:{ flexDirection:'row', alignItems:'center', gap:8, marginTop:10 },
  label:{ color:'#aaa' },
  value:{ color:'#fff', width:48 },
  input:{
    flex:1,
    backgroundColor:'#222', color:'#fff',
    paddingHorizontal:10, paddingVertical:8,
    borderRadius:6, borderWidth:1, borderColor:'#333'
  },
  btn:{ paddingHorizontal:12, paddingVertical:10, backgroundColor:'#0b7285', borderRadius:6 },
  btnTxt:{ color:'#fff', fontWeight:'700' },
});
