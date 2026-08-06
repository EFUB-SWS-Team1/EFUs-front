```
단체의 회비와 행사 예산을 더 쉽고 투명하게 관리하는 서비스, EFUs 💸
EFUB SWS 1팀 EFUs 프로젝트입니다.
```

</br>

# 💻 Frontend Developer

| 마승혜 | 최수연 |
|:---:|:---:|
| [@seunghyema](https://github.com/seunghyema) | [@sunny6312](https://github.com/sunny6312) |
| <p align="left">• 대시보드 페이지 전체<br>• 행사 페이지 전체<br>• 단체 관리 페이지 전체<br>• 로그인 후 단체 선택 플로우<br>• 공통 컴포넌트 (Button, Input, Modal, Card 등)<br>• 레이아웃/사이드바 등 공통 구조 정리<br>• 담당 화면 API 연동 및 axios 공통 설정<br>• 폴더 구조·라우팅 정리 및 머지 이슈 해결<br>• UI/UX 피드백 반영</p> | |

</br>


# 🎨 Design System

<img width="1440" height="1024" alt="Design System" src="https://github.com/user-attachments/assets/c65bb7f1-da4f-41cc-8503-09f1fdf48021" />


</br>

# ✨ Main Feature

| 단체 · 기수 | 구성원 · 초대 | 회비 |
|:---:|:---:|:---:|
| 내 단체 목록 조회</br>단체 생성 및 상세 조회</br>기수별 정보 확인 | 구성원 목록 및 상세 조회</br>역할별 구성원 확인</br>초대 코드를 통한 가입 | 회비 청구 내역 확인</br>납부 현황 조회</br>개별 납부 상태 관리 |

</br>

| 행사 · 예산 | 가계부 | 영수증 |
|:---:|:---:|:---:|
| 행사 목록 및 상세 조회</br>행사별 예산 현황 확인 | 수입 · 지출 내역 관리</br>통합 가계부 조회 | 영수증 이미지 업로드</br>영수증 이미지 조회 |

</br>

# ⚙️ Tech Stack

| Category | Technology | Description |
|:---:|:---:|:---|
| **Framework** | React | 프론트엔드 애플리케이션 개발 |
| **Language** | JavaScript | 서비스 UI 및 비즈니스 로직 구현 |
| **Build Tool** | Vite | 개발 서버 및 프로젝트 빌드 |
| **HTTP Client** | Axios | 백엔드 REST API 통신 |
| **State Management** | React Hooks | 클라이언트 상태 관리 |
| **Styling** | CSS Modules | UI 스타일링 |
| **Deploy** | Vercel | 프론트엔드 서비스 배포 |

</br>

# 📂 Foldering

```text
📁 src
├── 📁 assets
│
├── 📁 components
│   ├── 📁 common
│   └── 📁 layout
│       └── 📁 components
│
├── 📁 pages
│   ├── 📁 auth
│   ├── 📁 orgSelect
│   ├── 📁 dashboard
│   ├── 📁 groupManage
│   ├── 📁 event
│   └── 📁 ledger
│
├── 📁 api
│   ├── 📁 auth
│   ├── 📁 organization
│   ├── 📁 term
│   ├── 📁 funding
│   ├── 📁 transaction
│   ├── 📁 invitation
│   ├── 📁 member
│   └── 📁 charge
│
├── 📁 hooks
├── 📁 utils
├── 📁 styles
├── 📁 router
│
├── App
└── main
```

> 실제 프로젝트 폴더 구조에 맞게 수정합니다.

</br>

# 📝 Commit Convention

```text
[INIT] 프로젝트 초기 설정
[FEAT] 새로운 기능 구현
[FIX] 버그 및 오류 수정
[DESIGN] UI 디자인 및 스타일 수정
[REFACTOR] 코드 리팩토링
[CHORE] 설정 및 기타 작업
[DOCS] 문서 수정
```

예시

```text
[FEAT] 단체 목록 조회 구현

[FEAT] 회비 상세 페이지 API 연동

[DESIGN] 대시보드 UI 구현

[FIX] 로그인 리다이렉트 오류 수정

[CHORE] Vercel 배포 설정 추가
```

</br>

# 🌿 Git Flow

```text
main
│
│  배포 브랜치
│
└── develop
      │
      │  개발 통합 브랜치
      │
      ├── feature/login
      ├── feature/organization
      ├── feature/member
      ├── feature/transaction
      ├── feature/charge
      └── ...
```

```text
1. develop 브랜치에서 기능별 feature 브랜치를 생성합니다.

2. feature 브랜치에서 기능 개발을 진행합니다.

3. 작업 완료 후 develop 브랜치로 PR을 생성합니다.

4. 코드 리뷰 및 수정 사항 반영 후 develop에 merge합니다.

5. 기능 통합 및 테스트가 완료되면 develop → main PR을 생성합니다.

6. main 브랜치의 코드를 기준으로 서비스를 배포합니다.
```

개발 중 충돌을 최소화하기 위해 로컬 `develop` 브랜치를 자주 최신 상태로 유지하고,  
공통 컴포넌트나 다른 개발자의 담당 파일을 수정할 경우 팀원에게 먼저 공유합니다.

</br>

# 📚 API Specification

EFUs의 전체 API 명세는 아래 문서에서 확인할 수 있습니다.

[EFUs API 명세서 보러가기 ✔️](https://efub.notion.site/API-31fe1ad1c5f080b7bdf2ed9ddc19220c?source=copy_link)

</br>

# 💥 Trouble Shooting

EFUs 프론트엔드 개발 과정에서 발생한 문제와 해결 과정을 정리했습니다.

[EFUs 프론트엔드 트러블 슈팅 보러가기 ✔️](https://app.notion.com/p/efub/3b4e1ad1c5f080eea4a5e58b286ba337)

</br></br>
