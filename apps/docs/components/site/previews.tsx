"use client";
import type { ReactNode } from "react";
import {
  Avatar, Badge, Button, Card, Checkbox, Icon, Radio, RadioGroup,
  Spinner, Stack, Switch, Tab, TabList, Tabs, Text, TextField,
} from "@superbase/react";
import styles from "./previews.module.css";

const noop = () => {};

/* ─────────── 미니어처 4종 ───────────
 * Modal(포털)·Toast(명령형 useToast)·Header/BottomNavigation(전체 너비)은
 * 120px 카드 안에 실물을 렌더할 수 없다. 시맨틱 토큰만으로 정적 재현한다.
 * 토큰을 쓰므로 색·모서리가 실물과 일치하고 다크 모드도 자동 반영된다.
 */

function ToastMini() {
  return (
    <div className={styles.toast}>
      <span className={styles.toastIcon}><Icon name="success" size="sm" /></span>
      저장되었습니다
    </div>
  );
}

function ModalMini() {
  return (
    <div className={styles.modalScrim}>
      <div className={styles.modalPanel}>
        <div className={styles.modalTitle} />
        <div className={styles.modalLine} />
        <div className={styles.modalActions}>
          <span className={styles.modalBtnGhost} />
          <span className={styles.modalBtnPrimary} />
        </div>
      </div>
    </div>
  );
}

function HeaderMini() {
  return (
    <div className={styles.headerBar}>
      <span>Superbase</span>
      <span className={styles.headerBell}><Icon name="bell" size="sm" /></span>
    </div>
  );
}

function BottomNavMini() {
  const items = [
    { icon: "home", label: "홈", active: true },
    { icon: "search", label: "검색", active: false },
    { icon: "user", label: "프로필", active: false },
  ] as const;
  return (
    <div className={styles.bottomBar}>
      {items.map((it) => (
        <div
          key={it.label}
          className={[styles.bottomItem, it.active ? styles.bottomItemActive : ""].filter(Boolean).join(" ")}
        >
          <Icon name={it.icon} size="sm" />
          {it.label}
        </div>
      ))}
    </div>
  );
}

/* ─────────── 레지스트리 ───────────
 * 키는 lib/catalog.ts의 slug와 1:1 대응한다(previews.test.tsx가 강제).
 * 카드당 대표 인스턴스 1개만 — variant 나열 금지.
 * 모든 컴포넌트가 controlled라 고정값 + no-op 핸들러를 넘긴다.
 * PreviewFrame이 inert를 걸어 상호작용은 애초에 불가능하다.
 */
export const previews: Record<string, ReactNode> = {
  button: <Button variant="primary">확인</Button>,
  textfield: (
    <div className={styles.w220}>
      <TextField placeholder="이메일" value="" onChange={noop} />
    </div>
  ),
  checkbox: <Checkbox checked label="동의합니다" />,
  radio: (
    <RadioGroup value="a" aria-label="미리보기">
      <Radio value="a" label="선택됨" />
    </RadioGroup>
  ),
  switch: <Switch checked aria-label="미리보기" />,
  toast: <ToastMini />,
  modal: <ModalMini />,
  spinner: <Spinner size="lg" />,
  badge: <Badge variant="brand">NEW</Badge>,
  tabs: (
    <Tabs value="design">
      <TabList aria-label="미리보기">
        <Tab value="design">디자인</Tab>
        <Tab value="code">코드</Tab>
      </TabList>
    </Tabs>
  ),
  header: <HeaderMini />,
  "bottom-navigation": <BottomNavMini />,
  stack: (
    <Stack direction="row" gap={2}>
      <span className={styles.stackBox} />
      <span className={styles.stackBox} />
      <span className={styles.stackBox} />
    </Stack>
  ),
  card: (
    <Card elevation="sm" padding={3}>
      <Text variant="caption" weight="medium">Card</Text>
    </Card>
  ),
  avatar: <Avatar name="Jeong Hoon" />,
  text: <Text variant="title" weight="bold">Aa 가나다</Text>,
  icon: <Icon name="star" size={32} />,
};
