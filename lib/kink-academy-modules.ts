/**
 * Kink Academy 教程条目（最多展示 20 条，UI 一次显示 5 条可上下滑动）
 *
 * 添加条目：在 KINK_ACADEMY_MODULES 数组末尾追加对象：
 * { num: "21", title: "标题", desc: "简短描述" }
 * 可选外链：在 lib/kink-academy-links.ts → KINK_ACADEMY_MODULE_LINKS 按 num 配置
 * num 建议两位数字字符串；超过 20 条也会显示，但规格为 20 条。
 */

export type KinkAcademyModule = {
  num: string;
  title: string;
  desc: string;
};

export const KINK_ACADEMY_VISIBLE_COUNT = 5;
export const KINK_ACADEMY_TARGET_COUNT = 20;

export const KINK_ACADEMY_MODULES: KinkAcademyModule[] = [
  { num: "01", title: "100 First Time Kink Challenges", desc: "Beginner BDSM Tasks PDF, BDSM Starter & Digital Download" },
  { num: "02", title: "24 Bondage Tasks for Beginners", desc: "Starter Guide, Try Bondage & Digital Download" },
  { num: "03", title: "24 Humiliation Tasks for Beginners", desc: "Starter Guide, Try Humiliation & Digital Download" },
  { num: "04", title: "24 Beginner Brat Taming Tasks", desc: "Starter Guide, Digital Download" },
  { num: "05", title: "24 Pegging Tasks for Beginners", desc: "Starter Guide, Try Pegging & Digital Download" },
  { num: "06", title: "24 Beginner Sensory Play Tasks Guide", desc: "Starter Pack, Digital Download" },
  { num: "07", title: "100 Padded Humiliation & Shame-Play Challenges", desc: "ABDL Humiliation Tasks & Digital Download" },
  { num: "08", title: "24 Spanking Tasks for Beginners", desc: "Starter Guide, Try Spanking & Digital Download" },
  { num: "09", title: "100 Tasks for Submissive Women", desc: "Female Submission Training & BDSM Task PDF" },
  { num: "10", title: "100 TPE Challenges Slave Training Tasks PDF", desc: "Total Power Exchange & Digital Download" },
  { num: "11", title: "Femdom Essentials Bundle 300 Tasks 3 Books", desc: "BDSM Starter & Digital Download" },
  { num: "12", title: "ABDL Mega Bundle: 16 Books", desc: "1600 Padded Submission Tasks & Digital Download" },
  { num: "13", title: "Sissy Glam Collection 400 Tasks 4 Books", desc: "Discretion, community & digital hygiene" },
  { num: "14", title: "100 Solo Submissive Tasks", desc: "Self-Bondage Challenges , Lone Sub PDF" },
  { num: "15", title: "24 Sissy Tasks for Beginners", desc: "Starter Guide, Try Sissy & Digital Download" },
  { num: "16", title: "24 Cuckold Tasks for Beginners", desc: "Starter Guide, Try Cuckold & Digital Download" },
  { num: "17", title: "24 Beginner Latex Leather Tasks Guide", desc: "Starter PDF & Digital Download" },
  { num: "18", title: "100 Spicy Couples Ideas", desc: "Date Night Kink PDF, Bedroom Adventure Guide & Digital Download" },
  { num: "19", title: "100 Kinky Date Night Tasks for D/s Couples", desc: "BDSM Date Ideas PDF" },
  { num: "20", title: "Advanced 100 Tasks for Teacher Student", desc: "Doctoral Advisor Mentorship PDF" },
];
