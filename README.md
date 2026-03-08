# Sticker Museum

텔레그램 스티커를 미술관처럼 전시하는 단일 페이지 웹사이트입니다.  
커브드 디스플레이 느낌의 3D 전시 월을 기준으로 스티커가 배치됩니다.

## 실행

프로젝트 루트에서 아래 중 하나:

```bash
python3 -m http.server 5500
```

브라우저에서 `http://localhost:5500` 접속

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
