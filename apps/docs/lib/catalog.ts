export type Category = "Actions" | "Inputs" | "Feedback" | "Navigation" | "Layout" | "Data" | "Foundation";
export type Status = "stable" | "updated" | "new";

export interface CatalogItem {
  slug: string;
  name: string;
  category: Category;
  status: Status;
  blurb: string;
}

export const categoryOrder: Category[] = ["Actions", "Inputs", "Feedback", "Navigation", "Layout", "Data", "Foundation"];

export const catalog: CatalogItem[] = [
  { slug: "button", name: "Button", category: "Actions", status: "stable", blurb: "액션을 유도하는 기본 버튼. variant·size·loading·아이콘 슬롯." },
  { slug: "textfield", name: "TextField", category: "Inputs", status: "stable", blurb: "텍스트 입력. size·prefix/suffix·clearable·helperText." },
  { slug: "checkbox", name: "Checkbox", category: "Inputs", status: "stable", blurb: "체크박스. indeterminate 지원." },
  { slug: "radio", name: "Radio", category: "Inputs", status: "stable", blurb: "라디오 그룹. RadioGroup + Radio." },
  { slug: "switch", name: "Switch", category: "Inputs", status: "stable", blurb: "온/오프 토글. size sm/md." },
  { slug: "toast", name: "Toast", category: "Feedback", status: "stable", blurb: "명령형 useToast API. auto-dismiss·action." },
  { slug: "modal", name: "Modal", category: "Feedback", status: "stable", blurb: "compound Modal. focus-trap·scroll-lock." },
  { slug: "spinner", name: "Spinner", category: "Feedback", status: "stable", blurb: "로딩 스피너." },
  { slug: "badge", name: "Badge", category: "Feedback", status: "stable", blurb: "상태 뱃지. 6색·size·dot·icon." },
  { slug: "tabs", name: "Tabs", category: "Navigation", status: "stable", blurb: "compound Tabs. ARIA·키보드 내비." },
  { slug: "header", name: "Header", category: "Navigation", status: "new", blurb: "compound Header. onBack·알림 badge·bar/floating." },
  { slug: "bottom-navigation", name: "BottomNavigation", category: "Navigation", status: "updated", blurb: "하단 내비 바. bar/floating variant." },
  { slug: "stack", name: "Stack", category: "Layout", status: "stable", blurb: "flex 레이아웃 프리미티브." },
  { slug: "card", name: "Card", category: "Layout", status: "stable", blurb: "elevation·bordered·padding 카드." },
  { slug: "avatar", name: "Avatar", category: "Data", status: "stable", blurb: "이미지·이니셜·폴백. group·4 size." },
  { slug: "text", name: "Text", category: "Foundation", status: "stable", blurb: "타이포그래피 프리미티브. variant·weight·color." },
  { slug: "icon", name: "Icon", category: "Foundation", status: "stable", blurb: "라인 아이콘. 명명 size(xs/sm/md/lg)." },
];
