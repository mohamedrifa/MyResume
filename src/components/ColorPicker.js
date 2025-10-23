// ColorPicker.js
import React, {useMemo, useState, useEffect} from 'react';
import {View, Text, TextInput, Pressable, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
// Expo users:  import { LinearGradient } from 'expo-linear-gradient';

/* ===================== Utils ===================== */
const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

function hsvToRgb(h, s, v) {
  let c = v * s;
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = v - c;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
  else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
  else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
  else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
  else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}
const rgbToHex = ({r,g,b}) =>
  `#${[r,g,b].map(n=>n.toString(16).padStart(2,'0')).join('')}`;

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

/* ===================== 2D SV Square (fixed order) ===================== */
function SVSquare({hue, s, v, onChange, size=220}) {
  const {r,g,b} = hsvToRgb(hue, 1, 1);

  const handle = (evt) => {
    const {locationX, locationY} = evt.nativeEvent;
    const xRel = clamp(locationX / size);
    const yRel = clamp(locationY / size);
    onChange?.(xRel, 1 - yRel); // s=x, v=1-y
  };

  return (
    <View
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={handle}
      onResponderMove={handle}
      style={{width:size, height:size, borderRadius:6, overflow:'hidden'}}
    >
      {/* Bottom: saturation (white -> hue) */}
      <LinearGradient
        colors={['rgb(255,255,255)', `rgb(${r},${g},${b})`]}
        start={{x:0, y:0.5}} end={{x:1, y:0.5}}
        style={StyleSheet.absoluteFill}
      />
      {/* Top: value (black -> transparent) */}
      <LinearGradient
        colors={['rgba(0,0,0,1)', 'rgba(0,0,0,0)']}
        start={{x:0.5, y:1}} end={{x:0.5, y:0}}
        style={StyleSheet.absoluteFill}
      />
      {/* Thumb */}
      <View
        pointerEvents="none"
        style={{
          position:'absolute',
          left: clamp(s,0,1)*size - 10,
          top: (1-clamp(v,0,1))*size - 10,
          width:20, height:20, borderRadius:10,
          borderWidth:2, borderColor:'#fff',
          backgroundColor:'transparent',
        }}
      />
    </View>
  );
}

/* ===================== Vertical hue slider ===================== */
function HueSlider({hue, onChange, height=220, width=18}) {
  const handle = (evt) => {
    const {locationY} = evt.nativeEvent;
    const yRel = clamp(locationY / height);
    onChange?.(yRel * 360);
  };
  return (
    <View
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={handle}
      onResponderMove={handle}
      style={{width, height, borderRadius:3, overflow:'hidden'}}
    >
      <LinearGradient
        colors={['#f00','#ff0','#0f0','#0ff','#00f','#f0f','#f00']}
        locations={[0,1/6,2/6,3/6,4/6,5/6,1]}
        start={{x:0.5, y:0}} end={{x:0.5, y:1}}
        style={{flex:1}}
      />
      <View
        pointerEvents="none"
        style={{
          position:'absolute',
          left:-2,
          top: clamp(hue/360,0,1)*height - 2,
          width: width+4, height:4,
          borderRadius:2, backgroundColor:'#fff'
        }}
      />
    </View>
  );
}

/* ===================== Alpha slider ===================== */
function AlphaSlider({hue, alpha, onChange, height=220, width=18}) {
  const {r,g,b} = hsvToRgb(hue, 1, 1);
  const handle = (evt) => {
    const {locationY} = evt.nativeEvent;
    const yRel = clamp(locationY / height);
    onChange?.(1 - yRel);
  };
  return (
    <View
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={handle}
      onResponderMove={handle}
      style={{width, height, borderRadius:3, overflow:'hidden', backgroundColor:'#cfcfcf'}}
    >
      <LinearGradient
        colors={[`rgba(${r},${g},${b},1)`, `rgba(${r},${g},${b},0)`]}
        start={{x:0.5, y:0}} end={{x:0.5, y:1}}
        style={{flex:1}}
      />
      <View
        pointerEvents="none"
        style={{
          position:'absolute',
          left:-2,
          top: (1-clamp(alpha,0,1))*height - 2,
          width: width+4, height:4,
          borderRadius:2, backgroundColor:'#fff'
        }}
      />
    </View>
  );
}

/* ===================== Main Picker ===================== */
export default function ColorPicker({
  initialColor = '#0b7285',
  showAlpha = true,
  size = 220,
  onChange,
}) {
  const initRgb =
    hexToRgb(initialColor.replace(/[^#0-9a-f]/gi,'').slice(0,7)) ??
    {r:11,g:114,b:133};
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
      hsv: { h, s, v, a },
    });
  }, [hex, a, h, s, v, rgb, onChange, showAlpha]);

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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.preview}>
          <View style={styles.previewBg}/>
          <View style={[StyleSheet.absoluteFill, {backgroundColor: rgbaStr}]}/>
        </View>
        <Text style={styles.hexText}>{showAlpha ? withAlphaHex(hex, a) : hex}</Text>
      </View>

      {/* Picker */}
      <View style={styles.row}>
        <SVSquare hue={h} s={s} v={v} size={size}
                  onChange={(sat,val)=>{ setS(sat); setV(val); }}/>
        <View style={styles.slidersCol}>
          <HueSlider hue={h} onChange={setH} height={size}/>
          {showAlpha && <AlphaSlider hue={h} alpha={a} onChange={setA} height={size}/>}
        </View>
      </View>

      {/* Readouts */}
      <View style={styles.readouts}>
        <Text style={styles.label}>H:</Text><Text style={styles.value}>{Math.round(h)}</Text>
        <Text style={styles.label}>S:</Text><Text style={styles.value}>{Math.round(s*100)}%</Text>
        <Text style={styles.label}>V:</Text><Text style={styles.value}>{Math.round(v*100)}%</Text>
        <Text style={styles.label}>A:</Text><Text style={styles.value}>{Math.round(a*100)}%</Text>
      </View>

    </View>
  );
}

/* ===================== Styles ===================== */
const styles = StyleSheet.create({
  wrap: {
    padding: 14,
    backgroundColor: '#111',
    borderRadius: 10,
    width: 360,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    columnGap: 10,
  },
  preview: {
    width: 44, height: 44, borderRadius: 6,
    overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.4)',
    position: 'relative',
  },
  previewBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#cfcfcf', // simple neutral bg
  },
  hexText: { color: '#d8f3f3', fontWeight: '700' },
  row: { flexDirection: 'row', columnGap: 12 },
  slidersCol: { justifyContent: 'space-between' },
  readouts: {
    flexDirection: 'row', alignItems: 'center',
    columnGap: 8, marginTop: 10,
  },
  label: { color: '#aaa' },
  value: { color: '#fff', minWidth: 48 },
  hexRow: {
    flexDirection: 'row', alignItems: 'center',
    columnGap: 8, marginTop: 10,
  },
  input: {
    flex: 1, backgroundColor: '#222', color: '#fff',
    paddingVertical: 8, paddingHorizontal: 10,
    borderRadius: 6, borderWidth: 1, borderColor: '#333',
  },
  button: {
    paddingVertical: 10, paddingHorizontal: 12,
    backgroundColor: '#0b7285', borderRadius: 6,
  },
  buttonText: { color: '#fff', fontWeight: '700' },
});
