
import React from 'react';
import { BookOpen, Star, ArrowRight } from 'lucide-react';

interface Section {
  title: string;
  content: string;
  icon?: React.ElementType;
}

interface GenericLessonProps {
  title: string;
  subtitle: string;
  sections: Section[];
  level: string;
}

const GenericLesson: React.FC<GenericLessonProps> = ({ title, subtitle, sections, level }) => {
  return (
    <div className="space-y-12">
      <header className="animate-slideUp">
        <div className="inline-block px-3 py-1 bg-stone-900 text-stone-100 rounded-full text-xs font-bold tracking-wider uppercase mb-3 shadow-lg">
          {level}
        </div>
        <h2 className="text-4xl md:text-5xl font-bold serif text-stone-900 mb-6">
          {title} <span className="text-stone-300 font-light">|</span> {subtitle}
        </h2>
        <div className="h-1 w-20 bg-amber-500 rounded-full"></div>
      </header>

      <div className="grid gap-8 animate-slideUp stagger-1">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm card-hover group">
            <h3 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-3">
              <div className="p-2 bg-stone-100 rounded-xl text-stone-600 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                {section.icon ? <section.icon size={20} /> : <Star size={20} />}
              </div>
              {section.title}
            </h3>
            <p className="text-stone-600 leading-relaxed text-sm">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 text-center text-stone-500 text-sm italic animate-slideUp stagger-2">
        <BookOpen className="inline mr-2" size={16} />
        互动模块正在开发中，敬请期待更多实战训练。
      </div>
    </div>
  );
};

export default GenericLesson;
