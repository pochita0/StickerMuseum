# Sticker Museum

텔레그램 스티커를 미술관처럼 전시하는 단일 페이지 웹사이트입니다.  
커브드 디스플레이 느낌의 3D 전시 월을 기준으로 스티커가 배치됩니다.

## 실행

프로젝트 루트에서 아래 중 하나:

```bash
python3 -m http.server 5500
```

브라우저에서 `http://localhost:5500` 접속

## 텔레그램 스티커팩 저장

먼저 텔레그램에서 `@BotFather`로 봇을 만들고 토큰을 발급받습니다.

그 다음 프로젝트 루트에서:

```bash
export TELEGRAM_BOT_TOKEN="YOUR_BOT_TOKEN"
python3 scripts/download_telegram_pack.py "https://t.me/addstickers/Nethery_aeri005_by_fStikBot"
```

기본 저장 위치:

```text
packs/
  Nethery_aeri005_by_fStikBot/
    cover.webp
    manifest.json
    stickers/
    thumbs/
```

출력 폴더를 바꾸고 싶으면:

```bash
python3 scripts/download_telegram_pack.py "https://t.me/addstickers/Nethery_aeri005_by_fStikBot" --output ./assets/packs
```

`manifest.json`에는 팩 제목, 커버, 스티커 목록, 미리보기 경로가 들어갑니다.
이 값을 나중에 `script.js`의 전시 데이터로 연결하면 됩니다.

## 커스터마이징

`script.js`의 `STICKERS` 배열을 수정하면 됩니다.

- `title`: 작품명
- `description`: 설명
- `tags`: 태그 배열
- `image`: 스티커 이미지 경로

예시:

```js
{
  title: "내 스티커",
  description: "설명",
  tags: ["감정", "캐릭터"],
  emoji: "🙂",
  image: "./stickers/my-sticker.webp",
}
```

## 인터랙션

- 좌/우 버튼
- 키보드 `←`, `→`
- 마우스 휠 스크롤
- 랜덤 큐레이션 버튼
- 집중 감상 모드 버튼
