import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Music, Info, BookOpen } from 'lucide-react';

// === DATA DEFINITIONS ===

interface SymbolItem {
  id: string;
  name: string;
  englishName: string;
  category: 'notes' | 'rests' | 'clefs' | 'accidentals' | 'dynamics' | 'articulations' | 'ornaments' | 'navigation' | 'other';
  symbol: string | React.ReactNode;
  shortDesc: string;
  detailedDesc: string;
  howToPlay?: string;
  animationType?: 'pulse' | 'bounce' | 'shake' | 'spin' | 'float' | 'swing' | 'expand';
}

const symbolsData: SymbolItem[] = [
  // Clefs
  { id: 'treble_clef', name: '高音谱号', englishName: 'Treble Clef / G Clef', category: 'clefs', symbol: '𝄞', shortDesc: '确定G4音高的谱号', detailedDesc: '中心螺旋围绕五线谱第二线，确立该线为小字一组的G（G4）。通常指示右手演奏的中高音区旋律。', howToPlay: '准备用右手在钢琴中央C及以上的区域进行演奏。', animationType: 'float' },
  { id: 'bass_clef', name: '低音谱号', englishName: 'Bass Clef / F Clef', category: 'clefs', symbol: '𝄢', shortDesc: '确定F3音高的谱号', detailedDesc: '两个圆点夹着五线谱第四线，表示该线为小字组的F（F3）。通常用于左手弹奏的低音伴奏声部。', howToPlay: '准备用左手在钢琴中央C以下的区域进行演奏。', animationType: 'float' },
  { id: 'c_clef', name: '中音/次中音谱号', englishName: 'C Clef', category: 'clefs', symbol: '𝄡', shortDesc: '确定C4（中央C）音高的谱号', detailedDesc: '中心缺口对准哪条线，那条线就是中央C（C4）。中提琴常对准第三线，大提琴高音区常对准第四线。', animationType: 'float' },
  // Accidentals
  { id: 'sharp', name: '升号', englishName: 'Sharp', category: 'accidentals', symbol: '♯', shortDesc: '将音高升高半音', detailedDesc: '将原本的自然音符升高一个半音。', howToPlay: '弹奏目标音符右侧紧挨着的键。', animationType: 'bounce' },
  { id: 'flat', name: '降号', englishName: 'Flat', category: 'accidentals', symbol: '♭', shortDesc: '将音高降低半音', detailedDesc: '将原本的自然音符降低一个半音。', howToPlay: '弹奏目标音符左侧紧挨着的键。', animationType: 'bounce' },
  { id: 'natural', name: '还原号', englishName: 'Natural', category: 'accidentals', symbol: '♮', shortDesc: '取消升降号的影响', detailedDesc: '取消之前出现的升号、降号的影响，强制弹奏自然音高。', howToPlay: '直接弹奏该音符对应的白键。', animationType: 'pulse' },
  // Notes
  { id: 'whole_note', name: '全音符', englishName: 'Whole Note', category: 'notes', symbol: '𝅝', shortDesc: '时值为四拍的音符', detailedDesc: '空心椭圆符头。在4/4拍中占据整个小节，时值为四拍。', howToPlay: '平稳按下琴键，保持整整四拍的时间。', animationType: 'expand' },
  { id: 'half_note', name: '二分音符', englishName: 'Half Note', category: 'notes', symbol: '𝅗𝅥', shortDesc: '时值为两拍的音符', detailedDesc: '空心符头加符干。时值是全音符的一半，在4/4拍中占两拍。', howToPlay: '按下琴键并保持两拍的时间。', animationType: 'expand' },
  { id: 'quarter_note', name: '四分音符', englishName: 'Quarter Note', category: 'notes', symbol: '♩', shortDesc: '时值为一拍的音符', detailedDesc: '实心符头加符干。在4/4拍中代表一拍，是基本的节拍单位。', howToPlay: '按下琴键保持一整拍，感受稳定的脉动。', animationType: 'pulse' },
  { id: 'eighth_note', name: '八分音符', englishName: 'Eighth Note', category: 'notes', symbol: '♪', shortDesc: '时值为半拍的音符', detailedDesc: '实心符头、符干和一条符尾。时值是四分音符的一半。', howToPlay: '弹奏时间是四分音符的一半，心里默念"1-and-2-and"。', animationType: 'bounce' },
  // Rests
  { id: 'quarter_rest', name: '四分休止符', englishName: 'Quarter Rest', category: 'rests', symbol: '𝄽', shortDesc: '停顿一拍', detailedDesc: '表示音乐中一拍的绝对静音。', howToPlay: '在这一拍中不要弹奏，干净地切断声音。', animationType: 'pulse' },
  { id: 'eighth_rest', name: '八分休止符', englishName: 'Eighth Rest', category: 'rests', symbol: '𝄾', shortDesc: '停顿半拍', detailedDesc: '表示半拍的静音，常用于切分音或轻快的跳跃节奏中。', animationType: 'pulse' },
  // Dynamics
  { id: 'piano', name: '弱', englishName: 'Piano', category: 'dynamics', symbol: <span className="font-serif italic font-bold">p</span>, shortDesc: '轻声弹奏', detailedDesc: '指示演奏者以较小的音量和柔和的力度来弹奏。', howToPlay: '控制手臂重量，用较慢的下键速度触键。', animationType: 'pulse' },
  { id: 'forte', name: '强', englishName: 'Forte', category: 'dynamics', symbol: <span className="font-serif italic font-bold">f</span>, shortDesc: '大声弹奏', detailedDesc: '指示演奏者以较大的音量和力度来弹奏。', howToPlay: '利用手臂重量，更深、更快地触键。', animationType: 'expand' },
  { id: 'sforzando', name: '突强', englishName: 'Sforzando', category: 'dynamics', symbol: <span className="font-serif italic font-bold">sfz</span>, shortDesc: '突然的、强烈的重音', detailedDesc: '在特定的单个音符上突然施加极大的力度。', howToPlay: '瞬间发力触键产生极强音头，随后立即放松。', animationType: 'shake' },
  // Articulations
  { id: 'staccato', name: '跳音', englishName: 'Staccato', category: 'articulations', symbol: <div className="flex flex-col items-center"><div className="w-1.5 h-1.5 bg-current rounded-full mb-1"></div><span>♩</span></div>, shortDesc: '短促、断开地弹奏', detailedDesc: '音符应该弹得短促且与其他音符断开，通常只占其原本时值的一半。', howToPlay: '触键后迅速利用反作用力弹起手指，声音清脆。', animationType: 'bounce' },
  { id: 'accent', name: '重音', englishName: 'Accent', category: 'articulations', symbol: <div className="flex flex-col items-center"><span className="text-xl leading-none mb-0.5">&gt;</span><span>♩</span></div>, shortDesc: '强调某个音符', detailedDesc: '该音符应该比周围的音符弹得更响亮、更突出。', howToPlay: '施加额外的重量和更快的下键速度。', animationType: 'expand' },
  { id: 'tenuto', name: '保持音', englishName: 'Tenuto', category: 'articulations', symbol: <div className="flex flex-col items-center"><div className="w-3 h-[2px] bg-current mb-1"></div><span>♩</span></div>, shortDesc: '保持音符的完整时值', detailedDesc: '将音符的时值完完全全地弹满，带有轻微的强调意味。', howToPlay: '深沉地贴住琴键，直到最后一刻才离开。', animationType: 'pulse' },
  // Ornaments
  { id: 'trill', name: '颤音', englishName: 'Trill', category: 'ornaments', symbol: <div className="flex flex-col items-center"><span className="font-serif italic font-bold text-lg leading-none mb-0.5">tr</span><span>♩</span></div>, shortDesc: '主要音与上方邻音快速交替', detailedDesc: '在标记的音符和它上方相邻的音阶音之间进行快速、连续的交替。', howToPlay: '保持手腕极度放松，快速而均匀地交替击键。', animationType: 'spin' },
  { id: 'acciaccatura', name: '倚音 (短)', englishName: 'Grace Note', category: 'ornaments', symbol: <div className="flex items-end"><span className="text-sm line-through mr-0.5">♪</span><span className="text-2xl">♩</span></div>, shortDesc: '极短促的装饰音', detailedDesc: '几乎不占有时值，在主音发声的瞬间或极短的前一刻弹奏。', howToPlay: '手指轻轻“拂”过倚音的琴键，立刻落到主音上。', animationType: 'swing' },
  // Navigation
  { id: 'repeat_sign', name: '反复记号', englishName: 'Repeat Sign', category: 'navigation', symbol: '𝄆 𝄇', shortDesc: '重复两个记号之间的段落', detailedDesc: '回到左向的反复记号处重新演奏。', animationType: 'pulse' },
  { id: 'fermata', name: '延长记号', englishName: 'Fermata', category: 'navigation', symbol: <div className="flex flex-col items-center"><span className="text-2xl leading-none mb-0.5">𝄐</span><span>♩</span></div>, shortDesc: '自由延长音符的时值', detailedDesc: '根据音乐的情感需要，将该音符的时值延长。', howToPlay: '保持按下琴键，仔细倾听声音的衰减。', animationType: 'pulse' },
  // Other
  { id: 'pedal_down', name: '踩下延音踏板', englishName: 'Engage Pedal', category: 'other', symbol: <span className="font-serif italic font-bold text-2xl">𝆜</span>, shortDesc: '踩下右侧踏板', detailedDesc: '使所有弹奏的音符持续共鸣发声。', howToPlay: '用右脚前脚掌平稳、果断地踩下踏板。', animationType: 'bounce' }
];

const scalesData = [
  { id: 'major', name: '大调音阶', english: 'Major Scale', formula: '全-全-半-全-全-全-半', mood: '明朗、广阔、稳定', desc: '西方音乐中最基础、最重要的音阶。它建立在自然大调上，听起来明亮、积极，是许多古典和流行音乐的基石。' },
  { id: 'natural_minor', name: '自然小调', english: 'Natural Minor', formula: '全-半-全-全-半-全-全', mood: '柔和、暗淡、忧郁', desc: '大调的平行小调，从大调的第六级音开始。它的第三、六、七级音比同名大调低半音，赋予了它悲伤或内省的色彩。' },
  { id: 'harmonic_minor', name: '和声小调', english: 'Harmonic Minor', formula: '全-半-全-全-半-增二度-半', mood: '异域、紧张、古典', desc: '为了在小调中获得强烈的属到主的解决感，升高了自然小调的第七级音（导音）。这在第六和第七级之间产生了一个增二度，带来了浓郁的异国情调。' },
  { id: 'melodic_minor', name: '旋律小调', english: 'Melodic Minor', formula: '上行：全-半-全-全-全-全-半 / 下行：同自然小调', mood: '流畅、爵士、多变', desc: '为了消除和声小调中增二度带来的旋律上的不平滑，上行时升高六、七级音，下行时还原。在爵士乐中，旋律小调（通常上下行都升高）被广泛使用。' },
  { id: 'pentatonic', name: '大调五声音阶', english: 'Major Pentatonic', formula: '全-全-增二度-全-增二度', mood: '民族、空灵、和谐', desc: '去掉了大调音阶中容易产生不协和的第四和第七级音（半音关系）。它在世界各地的民族音乐（如中国传统音乐）以及流行、摇滚的吉他Solo中极为常见。' },
  { id: 'blues', name: '布鲁斯音阶', english: 'Blues Scale', formula: '半-半-增二度-全-半-增二度', mood: '忧郁、泥土气息、爵士', desc: '在小调五声音阶的基础上，加入了一个降五级音（Blue Note，蓝调音）。这个音带来了极强的摩擦感和独特的布鲁斯风味。' }
];

const modesData = [
  { id: 'ionian', name: '伊奥尼亚', english: 'Ionian', degree: 'I', formula: '1 2 3 4 5 6 7', mood: '快乐、稳定', desc: '建立在大调音阶的第一级音上。它实际上就是我们熟知的自然大调音阶，是现代调性音乐的中心。' },
  { id: 'dorian', name: '多利亚', english: 'Dorian', degree: 'II', formula: '1 2 ♭3 4 5 6 ♭7', mood: '爵士、带点忧郁的明亮', desc: '建立在第二级音上。它具有小调色彩（降3音），但拥有一个大六度（自然6音），这使得它比自然小调明亮，广泛应用于爵士乐和放克音乐中。' },
  { id: 'phrygian', name: '弗里吉亚', english: 'Phrygian', degree: 'III', formula: '1 ♭2 ♭3 4 5 ♭6 ♭7', mood: '西班牙风情、黑暗、神秘', desc: '建立在第三级音上。小调色彩，其标志性的降二度音带来了强烈的异域风情和紧张感，常用于弗拉门戈音乐或重金属中。' },
  { id: 'lydian', name: '莉底亚', english: 'Lydian', degree: 'IV', formula: '1 2 3 ♯4 5 6 7', mood: '梦幻、奇幻、悬浮', desc: '建立在第四级音上。大调色彩，但升四度音打破了原有的稳定感，产生了一种漂浮、未解决的梦幻效果，常用于电影配乐（如约翰·威廉姆斯的作品）。' },
  { id: 'mixolydian', name: '混合莉底亚', english: 'Mixolydian', degree: 'V', formula: '1 2 3 4 5 6 ♭7', mood: '布鲁斯、摇滚、开阔', desc: '建立在第五级音上。大调色彩，但降七度使其失去了强烈的导音倾向，带有一种布鲁斯和经典摇滚的风味。' },
  { id: 'aeolian', name: '爱奥尼亚', english: 'Aeolian', degree: 'VI', formula: '1 2 ♭3 4 5 ♭6 ♭7', mood: '悲伤、史诗、内省', desc: '建立在第六级音上。它实际上就是自然小调音阶，是表达悲伤、严肃或史诗感的主要调式。' },
  { id: 'locrian', name: '洛克里亚', english: 'Locrian', degree: 'VII', formula: '1 ♭2 ♭3 4 ♭5 ♭6 ♭7', mood: '极度紧张、不稳定、黑暗', desc: '建立在第七级音上。它是唯一一个主和弦是减三和弦（包含减五度）的调式，极度不稳定，因此在实际音乐中极少作为主调式使用。' }
];

const symbolCategories = [
  { id: 'all', label: '全部 (All)' },
  { id: 'clefs', label: '谱号 (Clefs)' },
  { id: 'notes', label: '音符 (Notes)' },
  { id: 'rests', label: '休止符 (Rests)' },
  { id: 'accidentals', label: '变音记号 (Accidentals)' },
  { id: 'dynamics', label: '力度 (Dynamics)' },
  { id: 'articulations', label: '发音 (Articulations)' },
  { id: 'ornaments', label: '装饰音 (Ornaments)' },
];

// === COMPONENTS ===

const SymbolsView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolItem | null>(null);

  const filteredSymbols = symbolsData.filter(symbol => {
    const matchesCategory = activeCategory === 'all' || symbol.category === activeCategory;
    const matchesSearch = symbol.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          symbol.englishName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getHoverVariants = (type?: string) => {
    switch (type) {
      case 'pulse': return { hover: { scale: [1, 1.15, 1], transition: { repeat: Infinity, duration: 1 } } };
      case 'bounce': return { hover: { y: [0, -8, 0], transition: { repeat: Infinity, duration: 0.6, ease: "easeOut" } } };
      case 'shake': return { hover: { x: [-3, 3, -3, 3, 0], transition: { repeat: Infinity, duration: 0.4 } } };
      case 'spin': return { hover: { rotate: [0, 15, -15, 0], transition: { repeat: Infinity, duration: 0.5 } } };
      case 'float': return { hover: { y: [-4, 4, -4], transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } } };
      case 'swing': return { hover: { rotate: [-10, 10, -10], transition: { repeat: Infinity, duration: 0.8 } } };
      case 'expand': return { hover: { scale: 1.2, transition: { duration: 0.2 } } };
      default: return { hover: { scale: 1.1, transition: { duration: 0.2 } } };
    }
  };

  const getModalAnimationProps = (type?: string) => {
    switch (type) {
      case 'pulse': return { animate: { scale: [1, 1.1, 1] }, transition: { repeat: Infinity, duration: 2 } };
      case 'bounce': return { animate: { y: [0, -10, 0] }, transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } };
      case 'shake': return { animate: { x: [-2, 2, -2, 2, 0] }, transition: { repeat: Infinity, duration: 2, repeatDelay: 1 } };
      case 'spin': return { animate: { rotateY: [0, 180, 360] }, transition: { repeat: Infinity, duration: 3, ease: "linear" } };
      case 'float': return { animate: { y: [-5, 5, -5] }, transition: { repeat: Infinity, duration: 4, ease: "easeInOut" } };
      case 'swing': return { animate: { rotateZ: [-5, 5, -5] }, transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } };
      case 'expand': return { animate: { scale: [1, 1.15, 1] }, transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } };
      default: return {};
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col h-full pt-2">
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative lg:w-72 flex-shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="搜索符号..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 transition-all font-medium shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex overflow-x-auto custom-scrollbar pb-2 lg:pb-0 gap-2 flex-1 items-center">
          {symbolCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id 
                  ? 'bg-stone-900 text-white shadow-md' 
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100 hover:border-stone-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-stone-200 border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
        {filteredSymbols.map(symbol => (
          <motion.button
            key={symbol.id}
            layoutId={`card-${symbol.id}`}
            onClick={() => setSelectedSymbol(symbol)}
            whileHover="hover"
            className="bg-white p-6 hover:bg-stone-50 transition-colors flex flex-col items-center text-center group cursor-pointer relative"
          >
            <div className="h-24 flex items-center justify-center text-5xl text-stone-800 mb-4 group-hover:text-stone-900 transition-colors">
              <motion.div variants={getHoverVariants(symbol.animationType)}>{symbol.symbol}</motion.div>
            </div>
            <h3 className="font-bold text-stone-900 text-sm">{symbol.name}</h3>
            <p className="text-[10px] text-stone-400 mt-1.5 uppercase tracking-widest font-bold">{symbol.englishName.split('/')[0].trim()}</p>
          </motion.button>
        ))}
        {filteredSymbols.length === 0 && (
          <div className="col-span-full bg-white p-12 flex flex-col items-center justify-center text-stone-400">
            <Search size={48} className="mb-4 opacity-20" />
            <p className="font-medium">没有找到匹配的符号</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedSymbol && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedSymbol(null)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-40" />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
              <motion.div layoutId={`card-${selectedSymbol.id}`} className="bg-[#f5f2ed] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh] border border-stone-200">
                <div className="p-10 pb-8 flex flex-col items-center relative bg-white border-b border-stone-200">
                  <button onClick={() => setSelectedSymbol(null)} className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                  <div className="h-32 flex items-center justify-center text-7xl text-stone-900 mb-6">
                    <motion.div {...getModalAnimationProps(selectedSymbol.animationType)}>{selectedSymbol.symbol}</motion.div>
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-stone-900">{selectedSymbol.name}</h2>
                  <p className="text-stone-500 font-bold tracking-widest uppercase text-xs mt-2">{selectedSymbol.englishName}</p>
                </div>
                
                <div className="p-10 overflow-y-auto custom-scrollbar">
                  <div className="mb-8">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">含义与解释</h4>
                    <p className="text-stone-900 leading-relaxed text-xl font-serif mb-4">{selectedSymbol.shortDesc}</p>
                    <p className="text-stone-600 leading-relaxed font-medium">{selectedSymbol.detailedDesc}</p>
                  </div>
                  {selectedSymbol.howToPlay && (
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Music size={14} /> 演奏技巧
                      </h4>
                      <p className="text-stone-600 leading-relaxed font-medium">{selectedSymbol.howToPlay}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ScalesView = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-12 pt-4 pb-12">
    {scalesData.map((scale, i) => (
      <div key={scale.id} className="relative border-t border-stone-200 pt-10">
        <div className="absolute top-6 right-0 text-[120px] font-serif font-black text-stone-100 -z-10 leading-none select-none tracking-tighter">
          {(i + 1).toString().padStart(2, '0')}
        </div>
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
          <div className="md:w-1/3">
            <h3 className="text-3xl font-serif font-bold text-stone-900">{scale.name}</h3>
            <p className="text-xs uppercase tracking-widest text-stone-500 font-bold mt-2">{scale.english}</p>
            <div className="mt-6 inline-block px-4 py-1.5 border border-stone-300 rounded-full text-xs font-bold text-stone-700 tracking-wider bg-white">
              {scale.mood}
            </div>
          </div>
          <div className="md:w-2/3">
            <p className="text-stone-700 leading-relaxed text-lg font-medium">{scale.desc}</p>
            <div className="mt-8 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Music size={14} /> 音程公式 Formula
              </div>
              <div className="font-mono text-sm md:text-base text-stone-800 tracking-wide bg-stone-50 p-4 rounded-xl border border-stone-100">
                {scale.formula}
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </motion.div>
);

const ModesView = () => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-8 pt-4 pb-12">
    <div className="mb-6 bg-stone-900 text-white p-8 rounded-3xl shadow-lg">
      <h3 className="font-serif text-2xl font-bold mb-3">教堂调式 Church Modes</h3>
      <p className="text-stone-300 text-lg leading-relaxed font-medium">
        起源于中世纪的欧洲，是现代大小调体系的前身。它们建立在自然大调的七个不同音级上，每个调式都有其独特的色彩和情感倾向。
      </p>
    </div>
    {modesData.map((mode) => (
      <div key={mode.id} className="group flex flex-col md:flex-row border border-stone-200 rounded-3xl overflow-hidden hover:border-stone-400 transition-all duration-300 bg-white shadow-sm hover:shadow-md">
        <div className="bg-stone-100 text-stone-900 p-8 md:w-48 flex flex-col items-center justify-center relative overflow-hidden border-r border-stone-200">
          <div className="absolute -right-4 -bottom-4 text-[120px] font-serif font-black text-stone-200 leading-none select-none">{mode.degree}</div>
          <div className="text-xs uppercase tracking-widest text-stone-500 mb-2 relative z-10 font-bold">Degree</div>
          <div className="text-6xl font-serif font-light relative z-10">{mode.degree}</div>
        </div>
        <div className="p-8 lg:p-10 flex-1 flex flex-col justify-center">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
            <div>
              <h3 className="text-3xl font-serif font-bold text-stone-900">{mode.name}</h3>
              <p className="text-xs uppercase tracking-widest text-stone-500 font-bold mt-2">{mode.english}</p>
            </div>
            <div className="md:text-right">
              <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">色彩 Mood</div>
              <div className="text-sm font-bold text-stone-800 border border-stone-300 px-4 py-1.5 rounded-full inline-block bg-stone-50">{mode.mood}</div>
            </div>
          </div>
          <p className="text-stone-600 text-lg mb-8 font-medium leading-relaxed">{mode.desc}</p>
          <div className="font-mono text-sm bg-stone-50 px-5 py-4 rounded-2xl border border-stone-200 text-stone-800 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-stone-400 font-sans text-xs uppercase tracking-widest font-bold">Formula</span>
            <span className="tracking-widest font-bold">{mode.formula}</span>
          </div>
        </div>
      </div>
    ))}
  </motion.div>
);

// === MAIN COMPONENT ===

const TheoryEncyclopedia: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'symbols' | 'scales' | 'modes'>('symbols');
  
  return (
    <div className="h-full flex flex-col md:flex-row gap-8 lg:gap-16 max-w-7xl mx-auto animate-slideUp bg-[#f5f2ed] rounded-3xl p-6 md:p-10 border border-stone-200 shadow-inner">
      {/* Sidebar */}
      <div className="md:w-64 flex-shrink-0 flex flex-col">
        <div className="mb-12">
          <h1 className="font-serif text-5xl md:text-6xl font-light tracking-tighter text-stone-900 mb-2">Theory</h1>
          <h2 className="font-serif text-2xl italic text-stone-500">Encyclopedia</h2>
        </div>
        
        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 border-b md:border-b-0 md:border-l border-stone-300 md:pl-8">
          <button onClick={() => setActiveSection('symbols')} className={`text-left py-4 px-4 md:px-0 relative group transition-colors ${activeSection === 'symbols' ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}>
            <div className="text-xs font-bold tracking-widest uppercase mb-1 opacity-60">01</div>
            <div className="font-serif text-2xl font-bold">音乐符号</div>
            <div className="text-xs font-bold tracking-widest uppercase mt-1 opacity-60">Symbols</div>
            {activeSection === 'symbols' && <motion.div layoutId="activeNav" className="absolute left-0 bottom-0 md:-left-8 md:top-0 md:bottom-auto w-full md:w-[2px] h-[2px] md:h-full bg-stone-900" />}
          </button>
          
          <button onClick={() => setActiveSection('scales')} className={`text-left py-4 px-4 md:px-0 relative group transition-colors ${activeSection === 'scales' ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}>
            <div className="text-xs font-bold tracking-widest uppercase mb-1 opacity-60">02</div>
            <div className="font-serif text-2xl font-bold">音阶</div>
            <div className="text-xs font-bold tracking-widest uppercase mt-1 opacity-60">Scales</div>
            {activeSection === 'scales' && <motion.div layoutId="activeNav" className="absolute left-0 bottom-0 md:-left-8 md:top-0 md:bottom-auto w-full md:w-[2px] h-[2px] md:h-full bg-stone-900" />}
          </button>
          
          <button onClick={() => setActiveSection('modes')} className={`text-left py-4 px-4 md:px-0 relative group transition-colors ${activeSection === 'modes' ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}>
            <div className="text-xs font-bold tracking-widest uppercase mb-1 opacity-60">03</div>
            <div className="font-serif text-2xl font-bold">调式</div>
            <div className="text-xs font-bold tracking-widest uppercase mt-1 opacity-60">Modes</div>
            {activeSection === 'modes' && <motion.div layoutId="activeNav" className="absolute left-0 bottom-0 md:-left-8 md:top-0 md:bottom-auto w-full md:w-[2px] h-[2px] md:h-full bg-stone-900" />}
          </button>
        </nav>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 md:pr-6">
        <AnimatePresence mode="wait">
          {activeSection === 'symbols' && <SymbolsView key="symbols" />}
          {activeSection === 'scales' && <ScalesView key="scales" />}
          {activeSection === 'modes' && <ModesView key="modes" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default TheoryEncyclopedia;
