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
  { id: 'treble_clef', name: '高音谱号', englishName: 'Treble Clef / G Clef', category: 'clefs', symbol: '𝄞', shortDesc: '确定G4（中央C之上的第一个G）音高的谱号', detailedDesc: '中心螺旋围绕五线谱第二线（G线），确立该线为小字一组的G（G4）。通常用于右手演奏的中高音区旋律。', howToPlay: '准备用右手在钢琴中央C及以上的区域进行弹奏。保持手腕自然放松，使高音旋律清澈透明、富有歌唱性。', animationType: 'float' },
  { id: 'bass_clef', name: '低音谱号', englishName: 'Bass Clef / F Clef', category: 'clefs', symbol: '𝄢', shortDesc: '确定F3（中央C之下的第一个F）音高的谱号', detailedDesc: '起笔大圆点及后方两个小圆点夹着五线谱第四线，确定其为 F 音。作为低声部不可或缺的锚点，通常指示左手演奏的声部区。', howToPlay: '准备用左手在钢琴中央C以下的低音区进行演奏。注重指骨与琴键贴合的重力传递，弹出浑厚、有支撑感的音色。', animationType: 'float' },
  { id: 'c_clef', name: '中音/次中音谱号', englishName: 'C Clef', category: 'clefs', symbol: '𝄡', shortDesc: '确定C4（中央C）音高的谱号', detailedDesc: '两半弧线的交汇缺口对准哪条线，那条线就是中央C（C4）。常用于中提琴（中音谱号）以及大提琴的高音区（次中音谱号）。', howToPlay: '弹奏时请认准缺口所指示的线即为钢琴中央C（C4），眼睛要提前对准对应跨音组的白键。', animationType: 'float' },
  { id: 'percussion_clef', name: '打击乐谱号', englishName: 'Percussion Clef', category: 'clefs', symbol: '𝄦', shortDesc: '无确切音高的打击乐器谱号', detailedDesc: '不对应特定的绝对音高，常使用线和间的不同位置来代表不同的敲击乐器（如木鱼、沙槌、小鼓、大鼓等）。', howToPlay: '在钢琴演奏遇到时，通常预示需要通过拍击琴盖、琴身或利用特定打击手段来模拟敲击乐效果。', animationType: 'shake' },
  // Accidentals
  { id: 'sharp', name: '升号', englishName: 'Sharp', category: 'accidentals', symbol: '♯', shortDesc: '将音高升高一个半音', detailedDesc: '在原本的基本音符基础上升高一个半音（钢琴上表现为向右移动一个最近的琴键）。', howToPlay: '弹奏目标音符右侧最近的黑键或白键（例如升E弹F，升B弹C）。手型要饱满，指尖点向音心。', animationType: 'bounce' },
  { id: 'flat', name: '降号', englishName: 'Flat', category: 'accidentals', symbol: '♭', shortDesc: '将音高降低一个半音', detailedDesc: '在原本的基本音符基础上降低一个半音（钢琴上表现为向左移动一个最近的琴键）。', howToPlay: '弹奏目标音符左侧最近的黑键或白键（例如降C弹B，降F弹E）。手指贴键面自然向左下压。', animationType: 'bounce' },
  { id: 'natural', name: '还原号', englishName: 'Natural', category: 'accidentals', symbol: '♮', shortDesc: '撤销同一小节内升降记号的影响', detailedDesc: '消除该小节内在此位置之前出现的临时升号、降号或重升重降的影响，使其恢复到调号音轨的原始自然音。', howToPlay: '直接弹奏该音级原本对应的自然琴键，手腕自然垂落，神态放平平。', animationType: 'pulse' },
  { id: 'double_sharp', name: '重升号', englishName: 'Double Sharp', category: 'accidentals', symbol: '𝄪', shortDesc: '将音高升高一个全音（两个半音）', detailedDesc: '常见于调性复杂的古典乐章或和声功能进行中，指示在其原本基本音级上，往右翻过两个琴键弹奏。', howToPlay: '往右数两个最近的半音进行弹奏（例如，重升F即在钢琴上直接弹奏自然G键）。', animationType: 'expand' },
  { id: 'double_flat', name: '重降号', englishName: 'Double Flat', category: 'accidentals', symbol: '𝄫', shortDesc: '将音高降低一个全音（两个半音）', detailedDesc: '在古典音乐的严谨半音学和声中出现，指示将对应的基本音级向左平移两格琴键弹奏。', howToPlay: '往左数两个最近的半音进行弹奏（例如，重降B即在钢琴上直接弹奏自然A键）。', animationType: 'expand' },
  // Notes
  { id: 'whole_note', name: '全音符', englishName: 'Whole Note', category: 'notes', symbol: '𝅝', shortDesc: '时值为四拍的完整音符', detailedDesc: '经典的空心椭圆符头，不带符干。在最常用的4/4拍中占据整整一个小节，代表完整的节奏基础单元。', howToPlay: '按下琴键后保持全身重力稳定挂靠在琴键上，心中默数‘1-2-3-4’。直到四拍圆满结束，手腕再轻盈抬起。', animationType: 'expand' },
  { id: 'half_note', name: '二分音符', englishName: 'Half Note', category: 'notes', symbol: '𝅗𝅥', shortDesc: '时值为两拍的音符', detailedDesc: '空心椭圆符头，带有一根纵向的符干。其时值长度正好是全音符的二分之一。', howToPlay: '轻柔下键并饱满地坚守两拍，心中计算‘1 - 2’，要注意不要随意缩短时值，让琴弦发出透亮的回荡。', animationType: 'expand' },
  { id: 'quarter_note', name: '四分音符', englishName: 'Quarter Note', category: 'notes', symbol: '♩', shortDesc: '时值为一拍的基础音符', detailedDesc: '实心椭圆符头，带有符干。它是绝大多数古典及现代乐曲的基本节拍单位。', howToPlay: '指尖弹性触键，发音必须果断干练，感受稳定的脉动，做到每一拍长短都极其均衡。', animationType: 'pulse' },
  { id: 'eighth_note', name: '八分音符', englishName: 'Eighth Note', category: 'notes', symbol: '♪', shortDesc: '时值为半拍的音符', detailedDesc: '实心符头，带有符干和一条微翘的符尾。如果是连续出现的八分音符，常用横向黑色符杠联结在一起。', howToPlay: '在一拍的时间里极度均匀、顺畅地弹出两个音，心里默数‘1-and, 2-and’，训练两指的精确独立。', animationType: 'bounce' },
  { id: 'sixteenth_note', name: '十六分音符', englishName: 'Sixteenth Note', category: 'notes', symbol: '𝅘𝅥𝅯', shortDesc: '时值为四分之一拍的音符', detailedDesc: '实心符头，带两层平行符尾。时值极短，常在华丽的跑指或快速震音中大量应用。', howToPlay: '一拍里均匀地滚奏四个音符。手指第一关节必须像锤头一样快速独立点落在键盘，颗粒感强。', animationType: 'bounce' },
  { id: 'thirty_second_note', name: '三十二分音符', englishName: 'Thirty-second Note', category: 'notes', symbol: '𝅘𝅥𝅰', shortDesc: '时值为八分之一拍的音符', detailedDesc: '实心符头，带三层平行符尾。多见于肖邦、李斯特、莫扎特等名家的绚丽过门与装饰华彩句中。', howToPlay: '以极为轻软的拂键动作点过琴键，指尖几乎贴在键面做微米级振飘，声音如同一串珍珠滚落。', animationType: 'shake' },
  { id: 'dotted_note', name: '附点音符', englishName: 'Dotted Note', category: 'notes', symbol: <span className="font-serif">♩.</span>, shortDesc: '延长原音符时值一半的记号', detailedDesc: '写在音符头右侧的小圆点，表示将该音符自身原有时值增加一半（如附点四分音符占 1.5 拍）。', howToPlay: '计算好拉长的比例，与后方的分音节奏形成鲜明咬合，弹奏出高低错落、灵动的马蹄点子声。', animationType: 'pulse' },
  // Rests
  { id: 'whole_rest', name: '全休止符', englishName: 'Whole Rest', category: 'rests', symbol: '𝄻', shortDesc: '整小节休止或四拍停顿', detailedDesc: '贴在五线谱第四线下方的小黑色长方块，表示一整小节的所有声部都完全静止。', howToPlay: '双手完全离开键盘自然垂落膝上，心里继续感受无声的律动和心跳，并在这一刻做深沉的乐学呼吸。', animationType: 'float' },
  { id: 'half_rest', name: '二分休止符', englishName: 'Half Rest', category: 'rests', symbol: '𝄼', shortDesc: '休止两拍的时间', detailedDesc: '立在五线谱第三线上方的小黑色长方块，表示两拍时长的音乐停顿。', howToPlay: '起首干脆利落离键，手臂微抬，眼神专注于乐曲接下来的走向，做好再次下键的完全心理和生理准备。', animationType: 'float' },
  { id: 'quarter_rest', name: '四分休止符', englishName: 'Quarter Rest', category: 'rests', symbol: '𝄽', shortDesc: '休止一拍的时间', detailedDesc: '如波浪扭曲的符号，在标准的4/4拍子中，代表一个单位拍（一拍）的静音。', howToPlay: '在该拍点完全收掉一切声响，让声音干干脆脆地静止。指尖悬留在半空中做柔和的叹息。', animationType: 'pulse' },
  { id: 'eighth_rest', name: '八分休止符', englishName: 'Eighth Rest', category: 'rests', symbol: '𝄾', shortDesc: '休止半拍的时间', detailedDesc: '带有单个旋尾的小斜线，常用于切分音符之间，构成灵动跳跃、幽默滑稽风格的断格。', howToPlay: '干净切除发声，给节奏留白，随后的击键要高度精确、切中反拍，形成摇摆风格。', animationType: 'pulse' },
  { id: 'sixteenth_rest', name: '十六分休止符', englishName: 'Sixteenth Rest', category: 'rests', symbol: '𝄿', shortDesc: '休止四分之一拍的时间', detailedDesc: '带双层旋尾的小斜线，用作高频段落中极其精细的急停闪现及切分留空。', howToPlay: '手指动作敏捷，收放自如。指尖要具备极高收缩弹力，维持音乐的机洗和敏锐。', animationType: 'shake' },
  // Dynamics
  { id: 'pianissimo', name: '极弱', englishName: 'Pianissimo', category: 'dynamics', symbol: <span className="font-serif italic font-bold text-2xl">pp</span>, shortDesc: '极其微弱、轻悄的力度', detailedDesc: '创造一幅空灵、神秘、低声呢喃或远方回音的画卷。手指控制必须炉火纯青。', howToPlay: '贴键下深，利用大臂微微向高空提挂的力量来抵消重力，极慢速度压推触键至琴键底。', animationType: 'pulse' },
  { id: 'piano', name: '弱', englishName: 'Piano', category: 'dynamics', symbol: <span className="font-serif italic font-bold">p</span>, shortDesc: '轻声、柔和、单薄地弹唱', detailedDesc: '以优雅、温润的低调力度倾倒音乐。是歌唱声部或抒发委婉情感时的经典发力指标。', howToPlay: '手腕自然摇摆，手指第二三关节立稳，手臂放松，用平缓均匀的慢速度推按琴键。', animationType: 'pulse' },
  { id: 'mezzo_piano', name: '中弱', englishName: 'Mezzo-piano', category: 'dynamics', symbol: <span className="font-serif italic font-bold">mp</span>, shortDesc: '中等偏弱的力度', detailedDesc: '力度比 p 稍强一些，仍呈现克制、温存而含蓄的抒情特质。', howToPlay: '骨节稍稍支撑，由大臂自然传送些许重量至指端，弹唱出富有质感却不高昂的和谈之声。', animationType: 'pulse' },
  { id: 'mezzo_forte', name: '中强', englishName: 'Mezzo-forte', category: 'dynamics', symbol: <span className="font-serif italic font-bold">mf</span>, shortDesc: '中等偏强的日常表达力度', detailedDesc: '类似日常和蔼平静地说话，不带过多做作与夸张，代表钢琴弹奏的自然最松弛状态。', howToPlay: '手臂自然垂落，利用重力加速度自然触键，指端不僵硬，发出自信饱满的声音。', animationType: 'pulse' },
  { id: 'forte', name: '强', englishName: 'Forte', category: 'dynamics', symbol: <span className="font-serif italic font-bold">f</span>, shortDesc: '响亮、坚实、强大地弹唱', detailedDesc: '乐章的高昂顶点或大段情绪爆发，发出色彩斑斓、极具穿透力的和弦共鸣。', howToPlay: '腰背力量沿大臂、肘部直贯指端。指骨牢固，以较快的爆发速度击键，让琴弦尽情共鸣。', animationType: 'expand' },
  { id: 'fortissimo', name: '极强', englishName: 'Fortissimo', category: 'dynamics', symbol: <span className="font-serif italic font-bold text-2xl">ff</span>, shortDesc: '极其强横、狂飙宣泄的力度', detailedDesc: '引导极其强烈、惊涛骇浪或宏伟神圣的高潮。让三角钢琴的共鸣箱发挥最极致的声学波涛。', howToPlay: '全身上下力量下灌，落键极其迅猛。注意下键后手腕要立即恢复松解，避免“砸”出敲木头的燥杂声。', animationType: 'expand' },
  { id: 'sforzando', name: '突强', englishName: 'Sforzando', category: 'dynamics', symbol: <span className="font-serif italic font-bold">sfz</span>, shortDesc: '针对特定单个音符的突然爆破特强重音', detailedDesc: '在原本连贯前行的谱线上，针对这一个特立独行的和弦或音符突然施加重锤般突发力度。', howToPlay: '用全身极速贯穿发力下键，爆发出惊天动地的一记，随后手指立刻恢复松弛释压状态。', animationType: 'shake' },
  { id: 'crescendo', name: '渐强', englishName: 'Crescendo', category: 'dynamics', symbol: <span className="font-sans font-bold text-xl">&lt;</span>, shortDesc: '音量由弱渐渐变为强', detailedDesc: '用喇叭状开口符号或简写“cresc.”来表达，创造一种旭日东升、汹涌而至的史诗期待感。', howToPlay: '下键速度和手臂重量比例一阶一阶阶梯式增大，切忌暴强，把最大的高潮留到最终点。', animationType: 'expand' },
  { id: 'decrescendo', name: '渐弱', englishName: 'Decrescendo', category: 'dynamics', symbol: <span className="font-sans font-bold text-xl">&gt;</span>, shortDesc: '音量由强渐渐调微调弱', detailedDesc: '用渐窄的漏斗符号或“dim.”表达，流露出安抚、消散、沉静、回归尘土的神采。', howToPlay: '手指逐渐减少大臂的重量传递，将琴声一层层抹淡，使音响最终完美地消融在虚空大厅。', animationType: 'pulse' },
  // Articulations
  { id: 'staccato', name: '跳音/断奏', englishName: 'Staccato', category: 'articulations', symbol: <div className="flex flex-col items-center"><div className="w-1.5 h-1.5 bg-current rounded-full mb-1"></div><span>♩</span></div>, shortDesc: '短促、富有弹性、断开地弹琴', detailedDesc: '符头上方的黑色小圆点。其时值被削减为原本时值的一半左右，使音与音间有晶莹的断连空隙。', howToPlay: '手指像轻盈啄米的啄木鸟，手腕极富弹簧般的敏捷力，点按即收。发出亮丽跳动的颗粒音。', animationType: 'bounce' },
  { id: 'staccatissimo', name: '超跳音', englishName: 'Staccatissimo', category: 'articulations', symbol: <div className="flex flex-col items-center"><span className="text-xl leading-none mb-1">▾</span><span>♩</span></div>, shortDesc: '极短促、尖锐而有挑衅性的断奏', detailedDesc: '小倒三角箭头，时值被极限压缩为原本的四分之一。极富戏剧色彩。', howToPlay: '像是碰到了滚烫的火星，手腕抖动指端神速一闪撤起，干净利落。', animationType: 'bounce' },
  { id: 'accent', name: '重音记号', englishName: 'Accent', category: 'articulations', symbol: <div className="flex flex-col items-center"><span className="text-xl leading-none mb-0.5">&gt;</span><span>♩</span></div>, shortDesc: '大力强调、凸显该独立音符', detailedDesc: '向右张开口的小角号。指示该音应比周围的邻里音符拥有更结实、坚韧的前音重音。', howToPlay: '大拇指及掌骨锁定结实，将悬挂的大臂力量送入键中心，使音级格外高扬、稳若磐石。', animationType: 'expand' },
  { id: 'marcato', name: '特重音/强音', englishName: 'Marcato', category: 'articulations', symbol: <div className="flex flex-col items-center"><span className="text-xl leading-none mb-0.5">^</span><span>♩</span></div>, shortDesc: '比普通重音更为尖脆强劲的垂直重音', detailedDesc: '小尖帽立于符头。指示以大开大合、带有鲜明锤打色彩的极强力道袭击琴键。', howToPlay: '手指垂直砸击、锁定手骨。发出大钟般雷霆震怒的声音。', animationType: 'shake' },
  { id: 'tenuto', name: '保持音', englishName: 'Tenuto', category: 'articulations', symbol: <div className="flex flex-col items-center"><div className="w-3 h-[2px] bg-current mb-1"></div><span>♩</span></div>, shortDesc: '饱满、按足原时值、温情脉脉地强调', detailedDesc: '符头上的水平横短线。指示必须将该音符弹满其百分之百的物理长度，略带温馨的压实在上面。', howToPlay: '手部深陷下压，像在琴键上揉面或盖章。牢牢吸住键床，直到下一音到来瞬息才撤走。', animationType: 'pulse' },
  { id: 'legato', name: '连奏/滑行大弧线', englishName: 'Legato', category: 'articulations', symbol: <span className="text-2xl font-serif">◠</span>, shortDesc: '使旋律音与音之间极为无缝连绵、丝滑相连', detailedDesc: '两点或几点间的圆润连线。指示这期间的所有音符严禁刺目卡顿，像行云流水般完美粘合。', howToPlay: '全神贯注地滚动重心。必须等下一只手指彻底咬合击响琴键的一刹那，上一只手指才徐徐升起放音。', animationType: 'float' },
  // Ornaments
  { id: 'trill', name: '颤音', englishName: 'Trill', category: 'ornaments', symbol: <div className="flex flex-col items-center"><span className="font-serif italic font-bold text-lg leading-none mb-0.5">tr</span><span>♩</span></div>, shortDesc: '本音与上方紧挨着的二级音极高速来回交替鸣响', detailedDesc: '经典的锯齿颤线。属于巴洛克及古典乐章中，使枯燥长音饱含闪亮、珠圆玉润和光华流转的高超技巧装饰音。', howToPlay: '放松小臂与手背僵紧，大肘轻挂空中。用指尖跷跷板般的极敏捷力，放松高频平稳交替击键。', animationType: 'spin' },
  { id: 'acciaccatura', name: '倚音 (短)', englishName: 'Grace Note', category: 'ornaments', symbol: <div className="flex items-end"><span className="text-sm line-through mr-0.5">♪</span><span className="text-2xl">♩</span></div>, shortDesc: '在主音落键极前一瞬，闪电般掠过的超短小装饰音', detailedDesc: '斜横条穿入符尾的小音符。不占用主音符的核心时长，仅带来一缕吹打过脸颊的和煦微风。', howToPlay: '手掌像一拂开叶，最敏捷点压而过倚音，瞬间稳停压实在主音上，动作干净。', animationType: 'swing' },
  { id: 'appoggiatura', name: '长倚音', englishName: 'Appoggiatura', category: 'ornaments', symbol: <div className="flex items-end"><span className="text-sm mr-0.5">♪</span><span className="text-2xl">♩</span></div>, shortDesc: '分占主音一半时长、具有极其浓郁和声戏剧性的长倚饰音', detailedDesc: '没有横杠划去的斜小音。它会正大光明夺去主音符的时值，充满古典的宿命感与浪漫。', howToPlay: '优雅而庄严地将长倚音弹足它强占的时值，随之柔润、依依不舍解决滑落到主音上。', animationType: 'swing' },
  { id: 'mordent', name: '波音', englishName: 'Mordent', category: 'ornaments', symbol: <div className="flex flex-col items-center"><span className="text-2xl leading-none mb-0.5">𝄲</span><span>♩</span></div>, shortDesc: '本音-邻音-本音 的急速小翻卷波浪装饰音', detailedDesc: '平直折波符号（有上探、竖穿下探），给复调和早期古典乐句增添源源不断的灵动性。', howToPlay: '手腕端稳不动，三指迅猛一抖顺次敲下“本-邻-本”三音。在一刹那间完成闪耀点缀。', animationType: 'shake' },
  { id: 'turn', name: '回音', englishName: 'Turn', category: 'ornaments', symbol: <div className="flex flex-col items-center"><span className="text-2xl leading-none mb-0.5">𝄽</span><span>♩</span></div>, shortDesc: '围绕本音画环盘旋（上邻音-本音-下邻音-本音）', detailedDesc: '躺卧的艺术“S”曲线。音响在对应时点优雅地绕一大圈蝴蝶环，流露江南绣花、优雅不息的曼妙意境。', howToPlay: '两三根指关节极匀称快速画弧圆滚，均匀地在空中摇曳，平顺落回和解决在本音的琴面上。', animationType: 'swing' },
  // Navigation
  { id: 'repeat_sign', name: '反复记号', englishName: 'Repeat Sign', category: 'navigation', symbol: '𝄆 𝄇', shortDesc: '起止段落的大反复、重新温习演奏的指令栏', detailedDesc: '一粗一细二纵线伴双点。弹至右向‘𝄇’时，视线要闪电般跳转返回到左向‘𝄆’起始点，圆满再弹一遍。', howToPlay: '熟知重复节拍点。在拍子推进中无缝调转眼珠，流畅回归，没有一分一秒的前行中断。', animationType: 'pulse' },
  { id: 'fermata', name: '延长记号', englishName: 'Fermata', category: 'navigation', symbol: <div className="flex flex-col items-center"><span className="text-2xl leading-none mb-0.5">𝄐</span><span>♩</span></div>, shortDesc: '随心所欲拉长音符时值，留足呼吸换气空白', detailedDesc: '俗称“眼镜记号”。它给予作品情绪喘息或戏剧化悬念的高深手段。完全拉长延伸音乐时限。', howToPlay: '通常延长两倍到三倍的时值。眼睛微闭，听钢琴衰减，在乐音消散至极致、最后一刹离键抬高。', animationType: 'pulse' },
  { id: 'coda', name: '尾声记号', englishName: 'Coda', category: 'navigation', symbol: '𝄌', shortDesc: '尾声大飞跃跳转定位镜', detailedDesc: '十字靶心圆。在二次反复经过曲中时，凡瞥见它，说明接下来的大片谱页全跳升忽视，目光瞬间跃移至下方的‘Coda（尾声首句）’。', howToPlay: '动作要快。节奏绝不因找谱发生丝毫迟延，顺畅滑入最终的辉煌收尾小节前行。', animationType: 'spin' },
  { id: 'segno', name: '迭音记号', englishName: 'Segno', category: 'navigation', symbol: '𝄋', shortDesc: '大级反复段路记路标', detailedDesc: '由 Dal Segno (D.S.) 信号弹传唤，这是它往回拉扯视线时真正的指定反复大本营起点。', howToPlay: '只要有 D.S. 信号，不用任何迟疑，直接把眼睑一翻，对准印挂在旋律高出的这个花式𝄋开始演奏。', animationType: 'pulse' },
  { id: 'double_barline', name: '双纵线/终点止线', englishName: 'Double Barline / Fine', category: 'navigation', symbol: '𝄂', shortDesc: '乐章分割或者是曲终戏结的终止分界线', detailedDesc: '双细纵线（和弦转调、拍号转换分水岭）或一细一粗重终止线（宣告这整出乐章全剧终）。', howToPlay: '如果是细双线，可稍事换气；若是厚重终止线，最终音落下后，手随呼吸惯性慢落大腿，余音深远。', animationType: 'pulse' },

  // Other
  { id: 'pedal_down', name: '踩下延音踏板', englishName: 'Engage Pedal', category: 'other', symbol: <span className="font-serif italic font-bold text-2xl">𝆜</span>, shortDesc: '深深踩下最右延音踏板，托升消音块放飞泛音', detailedDesc: '钢琴家李斯特与肖邦极为钟情的“钢琴之魂”。释放全部毛毡，令所有琴弦在空气里形成神圣宏伟的和声共震。', howToPlay: '右掌前部贴实右侧脚踏板，果断、饱满而优雅地一沉到底。多重和弦色彩瞬息如油画般重叠堆垒。', animationType: 'bounce' },
  { id: 'pedal_up', name: '抬起/释放踏板', englishName: 'Release Pedal', category: 'other', symbol: <span className="font-serif italic font-bold text-2xl">𝆛</span>, shortDesc: '立刻抬高踏板阀门，利落止息余音防止污浊', detailedDesc: '雪花折线向上箭头。将消音垫迅速击落压实琴弦，瞬间扫除滞留在空气中的残余噪音，还以一派通透。', howToPlay: '以前掌为弹力轴心，闪电般柔和、利索地上抬回弹离开踏板，手脚呼应，切忌发出底盘碰撞的砰砸声。', animationType: 'bounce' },
  { id: 'arpeggio', name: '琶音记号', englishName: 'Arpeggio', category: 'other', symbol: <div className="flex flex-col items-center"><span className="text-xl leading-none font-bold">⌇</span><span>𝄃</span></div>, shortDesc: '和弦音阶由低至高依次珠润落盘连贯发出', detailedDesc: '一缕游动的游蛇波浪垂直线。指示这个大和弦里的好几个音禁止一同按下，必须行云流水般轻柔交叠弹起。', howToPlay: '五指像松鼠般由低到高逐级滚按音符，右脚顺时踩实大踏板，将这些零散的乐点统统拢合熔化在和弦里。', animationType: 'swing' },
  { id: 'breath_mark', name: '呼吸记号/气口', englishName: 'Breath Mark', category: 'other', symbol: <span className="text-xl font-bold font-serif">,</span>, shortDesc: '乐句转弯处的微弱呼吸与气口暂停', detailedDesc: '空挂的精致逗号，指引乐声在此做极为轻盈不着痕迹的细微换气，给乐句注入高雅歌唱性。', howToPlay: '手指弹奏过此处时，顺势提手提腕，中断极瞬的发声，但心中推进的节拍器节律绝对不能迟疑、不抢拍。', animationType: 'float' }
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
