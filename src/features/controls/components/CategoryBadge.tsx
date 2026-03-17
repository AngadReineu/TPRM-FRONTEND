import type { Category } from '@/types/shared';

const CLASSES: Record<Category, string> = {
  Process:         'bg-[#ECFDF5] text-[#10B981]',
  Document:        'bg-[#F5F3FF] text-[#8B5CF6]',
  Technical:       'bg-[#EFF6FF] text-[#0EA5E9]',
  'Expected Res.': 'bg-[#FFFBEB] text-[#F59E0B]',
};

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md whitespace-nowrap ${CLASSES[category]}`}>
      {category}
    </span>
  );
}
