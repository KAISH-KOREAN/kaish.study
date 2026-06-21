import { useEffect, useMemo, useState } from "react";

const GOOGLE_SHEET_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbxmCBs9KGkVBSb5UvqykWkA1FcH7gH_poagkKdO2btW_pTanpEpdjIL77zhtw5qpiMrJg/exec";

const videoUrl = "/videos/297736-Trim.mp4";

const gammaMusicEmbedUrl =
  "https://www.youtube.com/embed/n4YghVcjbpw";

const navLinks = ["Home", "Studio", "About", "Journal", "Reach Us"];

type BackgroundMode = "morning" | "afternoon" | "night";
type ExerciseType = "vocabulary" | "translation" | "choice" | "topikReading" | "yonseiListening" | null;
type VocabMode = "meaning" | "sentenceChoice" | "fillBlank";

const backgroundOptions: {
  id: BackgroundMode;
  label: string;
  description: string;
}[] = [
  { id: "morning", label: "Sáng", description: "Tươi sáng" },
  { id: "afternoon", label: "Chiều", description: "Ấm áp" },
  { id: "night", label: "Tối", description: "Cinematic" },
];

const TOPIK_READING_LEVEL = "Ôn TOPIK II";
const TOPIK_READING_LESSON = "Đọc";
const YONSEI_LISTENING_LEVEL = "Luyện Nghe Yonsei 2";

const learningLevels = [
  "Luyện tập bảng chữ cái",
  "Sơ cấp 1A",
  "Sơ cấp 1B",
  "Sơ cấp 2A",
  "Sơ cấp 2B",
  "Trung cấp 1",
  "Trung cấp 2",
  "TOPIK 3-4",
  "TOPIK 5-6",
  YONSEI_LISTENING_LEVEL,
  TOPIK_READING_LEVEL,
];

const lessonsByLevel: Record<string, string[]> = {
  "Luyện tập bảng chữ cái": ["Bảng chữ cái"],
  "Sơ cấp 1A": ["Bài 1", "Bài 2", "Bài 3", "Bài 4", "Bài 5", "Bài 6", "Bài 7"],
  "Sơ cấp 1B": [
    "Bài 8",
    "Bài 9",
    "Bài 10",
    "Bài 11",
    "Bài 12",
    "Bài 13",
    "Bài 14",
    "Bài 15",
  ],
  "Sơ cấp 2A": ["Bài 1", "Bài 2", "Bài 3", "Bài 4", "Bài 5", "Bài 6", "Bài 7"],
  "Sơ cấp 2B": [
    "Bài 8",
    "Bài 9",
    "Bài 10",
    "Bài 11",
    "Bài 12",
    "Bài 13",
    "Bài 14",
    "Bài 15",
  ],
  [YONSEI_LISTENING_LEVEL]: Array.from({ length: 40 }, (_, index) => `Bài ${index + 1}`),
  [TOPIK_READING_LEVEL]: [TOPIK_READING_LESSON],
};

const levelKoreanName: Record<string, string> = {
  "Luyện tập bảng chữ cái": "한글 연습",
  "Sơ cấp 1A": "초급 1A",
  "Sơ cấp 1B": "초급 1B",
  "Sơ cấp 2A": "초급 2A",
  "Sơ cấp 2B": "초급 2B",
  [YONSEI_LISTENING_LEVEL]: "연세 한국어 읽기 2 듣기",
  [TOPIK_READING_LEVEL]: "TOPIK II 읽기",
};

const publicLearningLevels = ["Luyện tập bảng chữ cái", "Sơ cấp 1A", YONSEI_LISTENING_LEVEL, TOPIK_READING_LEVEL];
const teacherAccessCode = "KAISH2026";

const exerciseTypes: {
  id: ExerciseType;
  title: string;
  description: string;
}[] = [
  {
    id: "vocabulary",
    title: "Bài tập từ vựng",
    description: "Làm 3 dạng đề từ vựng và nộp điểm vào Google Sheet.",
  },
  {
    id: "translation",
    title: "Bài tập luyện dịch và sắp xếp thành câu có nghĩa",
    description: "Phần này sẽ được xây dựng ở bước tiếp theo.",
  },
  {
    id: "choice",
    title: "Bài tập chọn đáp án đúng",
    description: "Phần này sẽ được xây dựng ở bước tiếp theo.",
  },
];

type TopikReadingAnswer = "1" | "2" | "3" | "4";

type TopikReadingTest = {
  id: string;
  title: string;
  session: string;
  sourceFileName: string;
  pdfUrl: string;
  questionCount: number;
  readingType: string;
  note: string;
  answerKey?: Partial<Record<number, TopikReadingAnswer>>;
  answerKeySource?: string;
};

type YonseiAudioSource = {
  src: string;
  type: string;
};

type YonseiListeningLesson = {
  id: string;
  lessonNumber: number;
  lessonLabel: string;
  title: string;
  cd: string;
  audioSources: YonseiAudioSource[];
  clozeText: string;
};

type YonseiTextPart = {
  type: "text";
  text: string;
};

type YonseiBlankPart = {
  type: "blank";
  number: number;
  answer: string;
};

type YonseiClozePart = YonseiTextPart | YonseiBlankPart;


const topikExerciseTypes: {
  id: ExerciseType;
  title: string;
  description: string;
}[] = [
  {
    id: "topikReading",
    title: "Luyện đọc TOPIK II",
    description: "Mở đề đọc đúng theo file PDF đã tải lên và làm phiếu chọn 1-50.",
  },
];

const yonseiExerciseTypes: {
  id: ExerciseType;
  title: string;
  description: string;
}[] = [
  {
    id: "yonseiListening",
    title: "Bài nghe điền từ và dịch",
    description: "Nghe file audio của từng bài, điền từ còn thiếu, sau đó dịch toàn bộ nội dung sang tiếng Việt.",
  },
];

const yonseiListeningLessons: YonseiListeningLesson[] = [
  {
    id: "yonsei2-lesson-01",
    lessonNumber: 1,
    lessonLabel: "Bài 1",
    title: "나의 꿈",
    cd: "01",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-01.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-01.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-01.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-01.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-01.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-01.wav", type: "audio/wav" },
    ],
    clozeText: "저는 1987년에 [[1|부산]]에서 태어났습니다. 부산은 [[2|바다]]와 가까워서 저는 자주 바다에 갔습니다.\n\n저 넓은 바다 밖은 어떤 곳일까?\" 바다는 저에게 [[3|꿈]]을 주었습니다.\n\n저는 여러 [[4|나라]]의 이야기를 알고 싶어서 [[5|책]]을 많이 읽었습니다. 그리고 책에서 읽은 나라들을 모두 [[6|여행]]하고 싶었습니다. [[7|대학교]]에 다닐 때는 [[8|아르바이트]]를 해서 모은 돈 으로 여행을 할 수 있었습니다. 저는 춥고 눈이 많이 오는 나라와 따뜻하고 꽃이 피는 나라, 조용한 시골과 복잡한 도시 등 세계 여러 곳을 여행했습니다. 다른 나라에 가면 [[9|날씨]]도 다르고 문화도 다르기 때문에 여행은 더 즐거웠습니다.\n\n이제 저는 좀 더 넓은 곳에서 일할 준비가 됐습니다. 세계 어디든지 갈 수 있습니다. 연세 [[10|여행사]]에서 저에게 기회를 주시면 열심히 일할 것을 약속 드리겠습니다.",
  },
  {
    id: "yonsei2-lesson-02",
    lessonNumber: 2,
    lessonLabel: "Bài 2",
    title: "아름다운 우리 학교",
    cd: "03",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-02.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-02.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-02.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-03.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-03.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-03.wav", type: "audio/wav" },
    ],
    clozeText: "저는 한국에 온 지 두 달 됐습니다. 제가 다니는 [[1|학교]]는 한국에서 유명한 대학교 중 의 하나입니다. 우리 학교는 [[2|역사]]가 오래됐습니다. 그리고 [[3|캠퍼스]]도 넓고 아름답습 다. 학교 안에는 [[4|도서관]]과 [[5|학생회관]]과 병원이 있습니다. 도서관에는 [[6|컴퓨터실]]과 멀티미 디어실이 있고 학생회관에는 [[7|식당]]과 은행, 음악감상실, 건강센터가 있습니다. 모두 가 까이 있어서 이용하기가 편리합니다.\n\n제가 한국말을 배우는 [[8|한국어학당]]에는 여러 나라에서 온 학생들이 많아서 다양한 친구들을 만날 수 있습니다. 저는 평일에 오전 9시부터 오후 1시까지 [[9|수업]]이 있습니다. 수업이 끝난 후에 저는 친구와 점심을 먹고 자주 컴퓨터실에 가서 인터넷을 합니다. 주 말에는 학교 운동장에서 친구들과 같이 [[10|축구]]나 농구를 합니다.\n\n한국어학당에 있으면 여러 나라를 여행하는 것 같습니다. 저는 날마다 넓고 큰 세계 를 만납니다.",
  },
  {
    id: "yonsei2-lesson-03",
    lessonNumber: 3,
    lessonLabel: "Bài 3",
    title: "소중한 물건",
    cd: "05",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-03.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-03.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-03.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-05.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-05.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-05.wav", type: "audio/wav" },
    ],
    clozeText: "저는 [[1|원룸]]에서 혼자 살기 때문에 물건이 많지 않습니다. 하지만 [[2|노트북]], 엠피쓰리 (MP3), 디카, [[3|휴대전화]],[[4|가족사진]] 등 제가 좋아하는 것이 많습니다. 그 중에서 저에게 제일 소중한 것은 바로 [[5|밥솥]]입니다.\n\n저는 작년까지 [[6|부모님]]과 같이 살았기 때문에 [[7|어머니]]께서 날마다 밥을 해 주셨습 다. 그런데 지금은 부모님과 같이 살지 않고 제가 [[8|요리]]를 잘 못하기 때문에 혼자서 밥 을 해 먹는 것이 너무 어렵습니다. 그래서 밖에서 사 먹는 일이 많아서 [[9|건강]]이 조금 빠졌습니다.\n\n부모님은 항상 제 건강을 걱정하십니다. 그래서 어머니는 지난달에 저에게 밥솥을 보 내 주셨습니다. 이 밥솥은 작아서 혼자 밥을 해 먹기도 좋고 밥도 아주 빨리 됩니다.\n\n밥솥을 받고 오랜만에 따뜻한 밥을 해 먹었습니다. [[10|반찬]]이 많지 않았지만 밥이 따뜻 하니까 아주 맛있었습니다. 밥솥이 있어서 이제 밥을 하는 것이 어렵지 않습니다. 저는 이 밥솥으로 밥을 해 먹을 때마다 어머니를 생각합니다.",
  },
  {
    id: "yonsei2-lesson-04",
    lessonNumber: 4,
    lessonLabel: "Bài 4",
    title: "자연의 도시, 밴쿠버",
    cd: "07",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-04.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-04.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-04.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-07.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-07.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-07.wav", type: "audio/wav" },
    ],
    clozeText: "저는 [[1|캐나다]]에서 왔습니다. 우리나라의 남쪽에는 [[2|미국]]이 있고 북쪽에는 [[3|알래스카]]와 [[4|북극해]]가 있습니다. 캐나다는 세계에서 두 번째로 큰 나라입니다. 그렇지만 사람들이 많지 않아서 복잡하지 않고 살기가 좋습니다.\n\n제 고향은 캐나다 남서쪽에 있는 [[5|밴쿠버]]입니다. 밴쿠버의 서쪽에는 아름다운 바다가 있고 동쪽에는 [[6|로키산맥]]이 있습니다. 산과 바다가 있어서 공기가 맑고 깨끗합니다. 바 다에 가면 [[7|고래]]를 볼 수 있고 산에 가면 [[8|스키]]를 탈 수 있습니다. 밴쿠버에서 해마다 1 월 1일에 북극곰 수영대회가 열리면 사람들은 차가운 바닷물에서 수영을 합니다.\n\n제가 지금 살고 있는 [[9|서울]]과 제 고향 밴쿠버는 다른 것이 많습니다. 서울은 여름에 덥고 겨울에 추운데 밴쿠버는 여름에 날씨가 아주 좋고 겨울에 비가 많이 옵니다. 그 리고 서울에는 밤늦게까지 문을 여는 가게들도 많고 길에 다니는 사람들도 많지만 제 고향에는 저녁에 문을 여는 가게가 많지 않아서 밤이 되면 아주 조용합니다.\n\n저는 제 고향에서 가족들과 함께 많은 시간을 보냈습니다. 그래서 '고향 을 생각하면 사랑하는 가족들이 제일 먼저 생각납니다. 저는 한국에 와서 가족들을 못 본 지 6개 월 됐는데 [[10|방학]]이 되면 고향에 돌아가서 가족들을 만나고 고향 음식도 먹고 싶습니다",
  },
  {
    id: "yonsei2-lesson-05",
    lessonNumber: 5,
    lessonLabel: "Bài 5",
    title: "한국 사람과 떡",
    cd: "09",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-05.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-05.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-05.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-09.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-09.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-09.wav", type: "audio/wav" },
    ],
    clozeText: "떡은 한국 [[1|전통]] 음식 중의 하나입니다. 한국 사람들은 [[2|옛날]]부터 떡을 먹었습니다.\n\n한국 사람들은 떡을 좋아하기 때문에 [[3|특별한]] 날에는 떡을 나누어 먹습니다. [[4|아기]]가 태 어난 지 100일이 됐을 때와 1년이 됐을 때, 그리고 60번째 [[5|생일]]에 큰 잔치를 합니다. 이 렇게 큰 잔치를 할 때마다 떡을 먹습니다. 해마다 [[6|설날]]에는 흰떡으로 만든 떡국을 먹 고 추석에는 [[7|송편]]을 만들어서 같이 먹습니다. [[8|결혼식]] 날에도 떡을 준비하고 [[9|이사]]한 날 에도 이웃 사람들과 떡을 나누어 먹습니다. 제사를 지낼 때에도 떡을 준비합니다.\n\n한국에서는 [[10|붉은]] 떡을 먹으면 나쁜 일이 생기지 않을 거예요: 하고 생각합니다. 그래 서 잔치를 할 때나 이사를 했을 때 붉은 떡을 먹습니다.\n\n떡은 건강에 좋고 맛있어서 아침이나 간식으로 먹는 사람들이 많습니다. 그래서 떡 으로 만드는 음식도 여러 가지가 있습니다. 떡으로 떡국, 떡볶이, 떡라면, 떡피자 같은 음식을 만들 수 있습니다.\n\n여러분도 한국에 있을 때 떡을 많이 드셔 보세요.",
  },
  {
    id: "yonsei2-lesson-06",
    lessonNumber: 6,
    lessonLabel: "Bài 6",
    title: "특별한 날에 먹는 음식",
    cd: "11",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-06.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-06.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-06.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-11.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-11.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-11.wav", type: "audio/wav" },
    ],
    clozeText: "오늘은 제 [[1|생일]]이기 때문에 [[2|친구]]들을 만났습니다. 저는 친구들과 같이 [[3|케이크]]를 먹 으려고 했는데 친구들은 이렇게 말했습니다.\n\n“제임스 씨, 오늘 [[4|미역국]]을 먹었어요?”\n\n“오늘은 제임스 씨 생일이니까 미역국을 먹으러 가요. 한국에서는 생일에 미역국을 먹는 [[5|풍습]]이 있어요.”\n\n그래서 우리는 [[6|한식집]]으로 갔습니다. 맛있게 미역국을 먹고 있는데 친구들은 모두 [[7|수진]] 씨에게 이렇게 물었습니다.\n\n“수진 씨, 언제 [[8|국수]]를 먹여 줄 거예요?” 사람들은 계속 그 질문을 했지만 수진 씨는 대답을 하지 않고 얼굴만 빨개졌습니다. 그 래서 저는 “수진 씨, 왜 그래요? 국수를 싫어해요?” 하고 물었습니다. 친구들은 제 말 을 듣고 모두 웃었습니다. 그때 다른 친구가 저에게 설명을 해 주었습니다.\n\n“제임스 씨, 한국에서는 [[9|결혼식]] 날 [[10|손님]]들에게 국수를 대접해요.”\n\n저는 수진 씨에게 다시 물어봤습니다.\n\n“수진 씨, 그럼 우리 언제 국수를 먹을 수 있어요?\"\n\n“제임스 씨, 저 다음 달에 결혼해요.” 수진 씨는 부끄러워했습니다.\n\n결혼식에서 먹는 국수는 특별한 맛일 것 같습니다. 저는 수진 씨의 결혼식에 가서 친 구들과 같이 국수를 먹고 싶습니다.",
  },
  {
    id: "yonsei2-lesson-07",
    lessonNumber: 7,
    lessonLabel: "Bài 7",
    title: "궁중떡볶이",
    cd: "13",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-07.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-07.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-07.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-13.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-13.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-13.wav", type: "audio/wav" },
    ],
    clozeText: "[[1|궁중떡볶이]]를 아십니까? 궁중[[2|떡볶이]]는 옛날에 궁중에서 먹기 시작했습니다.\n\n궁중떡볶이는 요즘의 매운 떡볶이와 다르게 떡에 [[3|고기]]와 [[4|채소]]를 많이 넣고 [[5|간장]]으로 만든 음식입니다.\n\n@ 물에 소금을 조금 넣고 끓이세요. 물이 끓으면 떡볶 이 떡을 넣고 데칩니다. 데친 떡을 찬물로 씻은 후에 물을 빼고 참기름을 바릅니다.\n\n@ [[6|소고기]]와 [[7|표고버섯]]은 가늘게 썹니다. 여기에 간장), 설탕(0.5), 참기름, 후춧가루를 넣습니다.\n\n@ [[8|당근]], 피망, [[9|양파]], 파, 붉은 고추도 가늘게 썹니다.\n\n@ 간장(3)에 설탕(1.5), 다진 마늘(0.5), 다진 파, 참기름, 깨, 후춧가루를 넣어서 [[10|양념장]]을 만듭니다.\n\n@큰 프라이팬에 식용유를 조금 넣고 파와 양파부터 볶습니다. 그리고 소고기와 표고버섯, 떡을 넣고 볶 습니다. 그 다음에 당근, 피망, 붉은 고추를 순서대로 넣고 볶습니다.\n\n@ 볶은 재료에 양념장을 넣고 모든 재료가 다 익을 때 까지 더 볶습니다.\n\n@ 불을 끄고 참기름, 깨, 후춧가루를 뿌립니다.\n\n떡볶이 떡 소고기 50g 표고버섯 2개 당근 50g 피망 1/2개 양파 1/4개 붉은 고추 1개\n\n양념 재료 간장 4숟가락, 설탕 2숟가락, 다진 파 2숟가락, 다진 마늘 1숟가락, 식용유, 참기름, 깨, 후춧가루",
  },
  {
    id: "yonsei2-lesson-08",
    lessonNumber: 8,
    lessonLabel: "Bài 8",
    title: "음식과 문화",
    cd: "15",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-08.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-08.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-08.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-15.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-15.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-15.wav", type: "audio/wav" },
    ],
    clozeText: "사람들은 모두 [[1|음식]]을 생각하면 즐거워질 것입니다.\n\n무엇을, 어떻게 먹을까?' 아주 오랜 [[2|옛날]]부터 사람들은 이런 생각을 했습니다. 그리고 음식과 음식을 먹는 방법 은 나라마다 아주 다양합니다.\n\n한국 음식은 [[3|국물]]이 많기 때문에 [[4|숟가락]]과 [[5|젓가락]]을 사용하고 밥을 먹을 때도 [[6|그릇]] 을 상 위에 놓고 숟가락으로 먹습니다. 일본 사람들은 밥을 젓가락으로 먹기 때문에 밥 그릇을 들고 먹어야 합니다. [[7|중국]]에는 튀긴 음식과 볶은 음식이 많아서 기쁨이 많고 뜨겁기 때문에 중국 젓가락은 한국 젓가락보다 더 깁니다.\n\n노르웨이는 겨울이 긴 나라입니다. 그래서 사람들은 고기나 [[8|생선]]에 소금을 뿌려서 말린 후에 추운 겨울에도 오랫동안 먹을 수 있는 음식을 만들었습니다. [[9|인도네시아]]는 날씨가 더워서 음식이 쉽게 상할 수 있기 때문에 볶은 음식이 많습니다.\n\n이렇게 나라마다 다른 식사 방법과 다양한 음식은 그 나라의 [[10|문화]]를 잘 보여 주는 것입니다. 다른 나라의 문화를 잘 알고 싶으면 그 나라의 음식을 드셔 보세요.",
  },
  {
    id: "yonsei2-lesson-09",
    lessonNumber: 9,
    lessonLabel: "Bài 9",
    title: "시장과 백화점",
    cd: "17",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-09.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-09.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-09.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-17.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-17.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-17.wav", type: "audio/wav" },
    ],
    clozeText: "저는 [[1|백화점]]보다 [[2|시장]]을 더 좋아합니다. 시장에는 여러 가지 [[3|물건]]도 많고 여기저기 돌아다니면 좋은 물건을 싸게 살 수 있기 때문입니다.\n\n백화점은 보통 오전 10시 반에 문을 여는데 시장은 저녁에 문을 여는 곳도 있습니다. 시장은 백화점과 다르게 [[4|카드]]를 쓸 수 없는 곳도 있지만 [[5|현금]]을 내면 물건 값을 깎아 주는 곳도 있습니다. 물건을 산 후에 물건이 마음에 안 들어서 바꾸려면 [[6|영수증]]이 필 요합니다.\n\n지난 주말에 저나는 친구와 같이 옷을 사러 [[7|동대문시장]]에 갔습니다. 남대문시장에는 가 본 적이 있지만 동대문시장은 처음이었습니다. 밤에 가면 재미있는 [[8|공연]]도 보고 더 싸게 살 수 있을 것 같아서 밤에 갔습니다. 사람들이 쇼핑몰 앞에서 노래도 하고 춤도 추고 있었는데 아주 재미있었습니다. 동대문시장에는 [[9|디자이너]]가 옷을 만들어서 파는 가게들이 많아서 값도 싸고 다양한 모양의 예쁜 옷들이 많았습니다. 배우나 가수의 얼 굴 사진이 있는 [[10|티셔츠]]를 파는 가게도 있었습니다.\n\n저는 노란 모자와 제가 좋아하는 가수의 얼굴 사진이 있는 티셔츠를 샀고 친구는 하 얀 블라우스와 까만색 긴 바지를 샀습니다.\n\n“좀 깎아 주세요”\n\n“한국말도 잘 하고 많이 샀으니까 싸게 드릴게요.\"\n\n우리는 예쁜 옷을 싸게 사서 기분이 좋았습니다.",
  },
  {
    id: "yonsei2-lesson-10",
    lessonNumber: 10,
    lessonLabel: "Bài 10",
    title: "수산 시장",
    cd: "19",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-10.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-10.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-10.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-19.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-19.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-19.wav", type: "audio/wav" },
    ],
    clozeText: "제 한국 친구 중에는 [[1|생선]]을 아주 좋아하는 친구가 있습니다. 그 친구는 저도 생선 을 좋아하는 것을 알고 [[2|수산]] [[3|시장]]을 소개해 줬습니다. 시장에는 여러 가지 [[4|해산물]]이 참 많았습니다. [[5|새우]], [[6|낙지]], [[7|오징어]] 등 모두 다 [[8|싱싱]]하고 맛있을 것 같았습니다. 저는 살아서 움직이는 낙지를 들고 사진도 찍었습니다.\n\n우리는 친구가 자주 가는 단골 가게에 가서 큰 생선 한 마리와 새우를 샀습니다. 가 게 주인아저씨는 서비스로 새우 두 마리를 더 주셨습니다. 우리는 가게 앞에 있는 식 당으로 갔습니다. 식당에서는 우리가 사 간 생선으로 회와 [[9|매운탕]]을 만들어 줬습니다. 친구 두 명과 함께 모두 셋이 먹었는데 아주 넉넉했습니다. 한국에 와서 이렇게 싱싱하 고 맛있는 회는 처음 먹어 봤습니다. 매운탕은 좀 맵지만 여러 가지 채소도 있고 맛있 었습니다.\n\n저는 한국에 여러 종류의 시장이 있는 것을 알고 있었습니다. 친구들과 동대문 시장 에도 가 보고 용산에 있는 [[10|전자상가]]에도 가 봤습니다. 그렇게 큰 수산 시장에는 처음 가 봤는데 오늘 여러 가지 재미있는 구경도 하고 맛있는 생선도 먹어서 정말 기분이 좋 았습나다. 다음에는 또 다른 시장에 가서 구경하고 싶습니다.",
  },
  {
    id: "yonsei2-lesson-11",
    lessonNumber: 11,
    lessonLabel: "Bài 11",
    title: "편리한 쇼핑",
    cd: "21",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-11.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-11.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-11.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-21.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-21.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-21.wav", type: "audio/wav" },
    ],
    clozeText: "저는 지난주에 [[1|책상]]을 사러 학교 앞 [[2|백화점]]에 갔습니다. 백화점은 물건들을 구경하 기 편했습니다. 그리고 [[3|점원]]들이 친절하게 설명을 해 줘서 좋았습니다. 저는 천천히 구 경을 하고 마음에 드는 것을 하나 골랐습니다. 하지만 그 책상은 값이 너무 비싸서 살 수 없었습니다. 그래서 싼 것을 사려고 [[4|시장]]으로 갔습니다. 저는 시장에서 여기저기 힘 들게 돌아다녔습니다. 저는 9시까지 구경을 했지만 마음에 드는 것이 없었습니다. 그래 서 책상을 사지 못하고 그냥 집으로 돌아왔습니다.\n\n집에 돌아왔을 때는 밤 10시가 넘었습니다. 저는 빨리 책상을 사고 싶어서 [[5|인터넷]]에 서 찾아봤습니다. 인터넷에는 여러 가지 책상이 많았습니다. 저는 [[6|서랍]]이 많고 값도 싼 책상을 찾았습니다. 이 책상을 제일 싸게 파는 [[7|사이트]]에 들어가서 다른 사람들이 쓴 글을 읽어 봤습니다. 또 여러 가지 색깔도 자세히 본 후에 [[8|초록색]] 책상으로 주문했습 니다\n\n3일 후에 책상이 집으로 [[9|배달]]됐습니다. 생각보다 빨리 와서 놀랐습니다. 그런데 색깔 이 인터넷에서 본 것보다 더 어두웠습니다. 다른 책상으로 바꿀까 했지만 인터넷으로 산 것은 바꾸기가 복잡할 것 같아서 그만두었습니다.\n\n이제부터 저는 이 책상에서 열심히 [[10|공부]]하겠습니다.",
  },
  {
    id: "yonsei2-lesson-12",
    lessonNumber: 12,
    lessonLabel: "Bài 12",
    title: "중고품 시장",
    cd: "23",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-12.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-12.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-12.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-23.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-23.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-23.wav", type: "audio/wav" },
    ],
    clozeText: "새 책과 [[1|헌 책]] 중에서 어느 것이 더 좋으세요? 많은 사람들이 헌 책 보다 새 책을 사 고 싶어합니다. 하지만 새 책이 3만 원인데 헌 책은 만 원이면 어느 것을 사시겠어요?\n\n[[2|중고품]] 시장에는 아이들의 옷과 [[3|장난감]], [[4|가전제품]]이나 [[5|주방용품]], 요즘에는 살 수 없는 옛날 물건 등 여러 가지 물건이 있습니다. 가끔은 중고품 시장에 새 것 같은 물 건들도 있습니다.\n\n서울에서는 [[6|구청]]에서 주말에 중고품 시장을 여는데 사람들은 자기가 사용한 물건 을 거기에 가지고 가서 팔 수 있습니다. 그리고 거기에서 다른 사람이 사용한 물건도 살 수 있습니다. 또 사람들은 자기가 사용하지 않는 물건을 [[7|아름다운]] 가게'에 줍니 다. 아름다운 가게'에서는 그 물건들을 싼 값에 팔아서 어려운 사람들을 돕습니다. [[8|풍물시장]]에 가면 고가구나 옛날 사진기 같은 구하기 어려운 물건들을 구경하고 살 수 있습니다.\n\n중고품은 고르기가 좀 어렵기는 하지만 물건을 싸게 살 수 있어서 좋고 [[9|쓰레기]]를 줄일 수 있으니까 [[10|환경]] 보호에도 좋습니다. 여러분도 시간이 있으면 중고품 시장에 가서 구경해 보세요.",
  },
  {
    id: "yonsei2-lesson-13",
    lessonNumber: 13,
    lessonLabel: "Bài 13",
    title: "친구의 생일 파티",
    cd: "25",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-13.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-13.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-13.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-25.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-25.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-25.wav", type: "audio/wav" },
    ],
    clozeText: "이번 주 [[1|수요일]]은 우리 반 친구 [[2|리에]]의 [[3|생일]]입니다. 저는 리에의 생일에 리에를 깜짝 놀라게 해 주고 싶습니다. 그래서 요즘 [[4|파티]] [[5|준비]]를 하는데 리에가 모르게 파티를 [[6|계획]] 하는 것은 쉬운 일이 아닙니다.\n\n“이번 주 수요일이 내 생일인데 그날 시간이 있어? 같이 저녁이나 먹을까?\"\n\n리에가 이런 말을 할 때마다 우리는 모두 잘 대답해 주지 않습니다\n\n“글쎄, 요즘은 좀 바쁜데 ……\n\n“잘 모르겠어. 내가 나중에 전화할게.” 이렇게 대답을 할 때 저는 가슴이 두근두근합니다. 그리고 기분이 좋지 않은 얼굴을 하는 리에를 보면 웃음이 나기도 합니다.\n\n오늘은 [[7|선물]]도 예쁘게 포장하고 [[8|식당]]도 예약했습니다. 우리는 리에가 식당에 오면 [[9|폭죽]]을 터뜨리고 노래를 부르려고 합니다. 그런데 어떻게 리에를 식당에 데리고 갈 수 있을까요?\n\n“리에야, [[10|숙제]]가 어려운데 와서 좀 도와 줄 수 있어?”\n\n“리에야, 지금 친구들과 저녁을 먹을 거야. 아직 저녁을 안 먹었으면 같이 먹을까?”\n\n아직 좋은 방법을 생각하지 못했습니다. 어떻게 말하면 좋을까요?",
  },
  {
    id: "yonsei2-lesson-14",
    lessonNumber: 14,
    lessonLabel: "Bài 14",
    title: "친구 집 방문",
    cd: "27",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-14.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-14.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-14.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-27.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-27.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-27.wav", type: "audio/wav" },
    ],
    clozeText: "[[1|언어]] [[2|교환]]을 하는 한국 [[3|친구]]가 저를 집으로 [[4|초대]]했습니다. 한국 사람 집에 처음 가 보는 것이어서 며칠 전부터 기다려졌습니다. 그 [[5|동네]]에는 가 본 적이 없기 때문에 걱정 이 됐는데 친구가 [[6|버스정류장]]에 마중 나와서 고마웠습니다.\n\n친구 집에 가니까 친구 가족이 모두 저에게 반갑게 인사를 했습니다. 저는 친구 어머 니께 [[7|꽃다발]]을 드렸는데 친구 여동생이 꽃보다 더 예쁜 것 같았습니다. 미국과 다르게 한국에서는 집 안에 들어갈 때 [[8|신발]]을 벗어야 했습니다. 방에 들어가니까 상에는 맛있 는 음식이 많이 있었습니다.\n\n“차린 것은 없지만 많이 드세요”\n\n“네? 음식이 정말 많은데요. 잘 먹겠습니다”\n\n제가 [[9|젓가락]]을 사용할 때 힘들어하니까 친구 어머니께서 [[10|포크]]를 주셨습니다. 그리고 제가 고기와 생선을 잘 먹는 것을 보시고 고기와 생선을 제 앞에 놓아 주셨습니다. 음 식을 맛있게 먹은 후에 저는 친구 가족과 같이 밤늦게까지 이야기도 하고 게임도 했습 니다. 아주 재미있었습니다. 그리고 친구 아버지께서 자동차로 저를 기숙사까지 데려다 주셨습니다.\n\n친구 가족의 따뜻한 마음을 느낄 수 있는 좋은 시간이었습니다.",
  },
  {
    id: "yonsei2-lesson-15",
    lessonNumber: 15,
    lessonLabel: "Bài 15",
    title: "청첩장",
    cd: "29",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-15.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-15.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-15.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-29.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-29.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-29.wav", type: "audio/wav" },
    ],
    clozeText: "오랫동안 기다렸습니다. 그리고 드디어 [[1|인생]]의 [[2|반쪽]]을 만났습니다.\n\n저희 두 사람은 두 개의 반쪽으로 하나의 [[3|가정]]을 이루려고 합니다. [[4|사랑]]과 [[5|믿음]]으로 아름다운 가정을 만들어 더 큰 사랑을 나누겠습니다. 바쁘시겠지만 오셔서 축하해 주시면 큰 [[6|기쁨]]이 되겠습니다.\n\n[[7|김영수]]의 장남 [[8|준혁]] 강양자\n\n박정근 한은실의 차녀 [[9|지혜]]\n\n*일시 : 2010년 10월 21일 목요일 저녁 6시 *장소 : [[10|연세대학교]] 동문회관 2층",
  },
  {
    id: "yonsei2-lesson-16",
    lessonNumber: 16,
    lessonLabel: "Bài 16",
    title: "친구의 결혼식",
    cd: "31",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-16.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-16.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-16.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-31.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-31.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-31.wav", type: "audio/wav" },
    ],
    clozeText: "오늘은 제일 친한 친구인 [[1|지혜]]의 [[2|결혼식]] 날이었다. 제일 친한 친구가 결혼하니까 기쁘기도 하고 섭섭하기도 했다. 오늘 결혼식에서 내가 지혜의 [[3|부케]]를 받기로 했는데 나는 아직 친구의 결혼식에서 부케를 받은 적이 없기 때문에 아침부터 [[4|마음]]이 설레 었다. 결혼식은 13시였지만 나는 지혜를 도와주려고 서둘러서 준비를 하고 일찍 집에 서 나갔다.\n\n[[5|결혼식장]]에는 사람들이 아주 많아서 좀 시끄러웠다. 결혼식에는 [[6|신랑]]과 [[7|신부]]의 친 구들보다 친척과 부모님의 친구들이 더 많이 오셨다. 결혼은 신랑과 신부, 두 사람이 하는 것이지만 한국에서 결혼식은 신랑 [[8|가족]]과 신부 가족에게 중요한 행사이기 때문 이다.\n\n결혼식은 오래 걸리지 않았다. 결혼식이 끝난 후에 기념 [[9|촬영]]을 하고 지혜가 나에 게 부케를 던졌다.\n\n내가 부케를 들고 있으니까 여러 사람들이 \"결혼식에서 부케를 받으면 6개월 안에 결혼해야 하는데 결혼할 남자 친구가 있어요?\" 하고 물었다. 아직 남자 친구도 없는 데 부케를 받아서 걱정이다. 하지만 그것보다 지혜가 정말 [[10|행복]]하게 잘 살았으면 좋 겠다.",
  },
  {
    id: "yonsei2-lesson-17",
    lessonNumber: 17,
    lessonLabel: "Bài 17",
    title: "서울 구경",
    cd: "33",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-17.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-17.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-17.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-33.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-33.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-33.wav", type: "audio/wav" },
    ],
    clozeText: "나는 오늘 친구와 같이 [[1|서울]] 시내를 구경하는 서울 도심순환[[2|버스]]를 탔다. 이 버스는 오전 9시부터 밤 9시까지 다니는데 표를 한 번 사면 하루 종일 이용할 수 있다. 또한 [[3|공휴일]]에도 탈 수 있어서 편리하다. 우리는 10시에 [[4|광화문]]에 있는 [[5|면세점]] 앞에서 이 버스 를 타, 이 버스에는 외국어 [[6|서비스]]가 있어서 듣고 싶은 언어로 설명을 들을 수 있다\n\n\"다음 [[7|정류장]]은 [[8|국립중앙박물관]]입니다. 내리실 분은 벨을 눌러 주세요. 버스는 30분 마다 있습니다”\n\n안내원이 한국어와 영어로 친절하게 설명해 줬다. 국립중앙박물관은 구경할 게 많았 지만 1시간만 구경하고 다시 버스를 탔다. 우리는 [[9|이태원]]에 내려서 쇼핑도 하고 점심도 먹었다. 그 다음에는 [[10|한옥]] 마을에 가서 여기저기 구경하고 한복도 입어 보고 떡도 먹 어 봤다. 그런 다음에 서울타워와 대학로도 구경했다.\n\n하루에 버스나 지하철을 여러 번 갈아타고 여기저기를 구경하기가 어려운데 도심순 환버스가 있어서 편리했다. 다음에는 다른 코스도 구경하고 싶다.",
  },
  {
    id: "yonsei2-lesson-18",
    lessonNumber: 18,
    lessonLabel: "Bài 18",
    title: "지하철 풍경",
    cd: "35",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-18.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-18.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-18.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-35.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-35.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-35.wav", type: "audio/wav" },
    ],
    clozeText: "많은 사람들은 [[1|지하철]]에서 하루를 시작합니다. 지하철은 [[2|버스]]보다 시간이 [[3|정확]]하고 갈아타기 쉽기 때문에 지하철을 타는 사람들이 많습니다.\n\n한국의 지하철은 [[4|안전]]하고 [[5|교통]] 카드를 사용할 수 있어서 이용하기가 편리합니다. 요 금도 다른 나라보다 싸고 [[6|새벽]]부터 밤늦게까지 이용할 수 있습니다. 서울에는 여러 지 하철이 있는데 호선마다 색이 다르기 때문에 가고 싶은 역을 쉽게 찾을 수 있습니다. 그 리고 [[7|안내방송]]이 나오기 때문에 어느 역인지 쉽게 알 수 있습니다. 지하철 안에는 노약 자들만 앉는 [[8|노약자석]]이 있고 젊은 사람들은 할아버지, 할머니가 타시면 자리를 양보합니다. 그리고 한국에서 65세가 넘은 노인들은 무료로 지하철을 이용할 수 있습니다\n\n는 지하철 안에서 사람들의 다양한 모습을 봅니다. 신문이나 책을 읽는 사람, 음 악을 듣는 사람, [[9|휴대전화]]로 게임을 하는 사람, 꾸벅꾸벅 조는 사람이 있습니다. 그리 고 큰 소리로 전화를 하는 사람이 있어서 시끄러울 때도 있습니다. 저는 가끔 지하철 안에서 [[10|숙제]]를 하는데 친절하게 가르쳐 주는 한국 사람도 있습니다.\n\n좀 복잡하기는 하지만 한국의 여러 사람들과 여러 모습을 볼 수 있는 지하철, 서울 에서 어디든지 쉽게 갈 수 있게 해 주는 지하철, 이 지하철에서 저도 많은 사람과 함께 하루를 시작합니다.",
  },
  {
    id: "yonsei2-lesson-19",
    lessonNumber: 19,
    lessonLabel: "Bài 19",
    title: "가 보고 싶은 지하철역",
    cd: "37",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-19.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-19.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-19.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-37.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-37.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-37.wav", type: "audio/wav" },
    ],
    clozeText: "그림도 보고 결혼식도 할 수 있는 [[1|지하철역]]을 아세요? 하루에 400만 명이나 이용하 는 [[2|서울]]의 지하철역 중에서 멋있고 재미있어서 가 보고 싶은 지하철역 몇 군데를 소개\n\n하겠습니다.\n\n3호선의 [[3|옥수역]] : [[4|미술관]]\n\n옥수역에는 예쁜 색이 많습니다. 컵 모양의 의자는 노란색이고 문은 빨간색, 노란 색, [[5|초록색]]으로 다양합니다. 그래서 옥수역에 가면 미술관에 간 것 같습니다. 4호선의 [[6|사당역]] : [[7|공연]]장\n\n사당역에서는 멕시코 전통 음악, 전자 바이올린, 힙합 등 다양한 공연을 합니다.\n\n음악도 듣고 공연도 보고 피에로도 만나려면 사당역에 가 보세요. 5호선의 [[8|광화문역]] : [[9|화랑]]\n\n광화문역 지하에는 화랑이 있습니다. 여기에서는 시, 그림, 사진 등 여러 가지 작 품을 전시합니다. 광화문역에 가서 재미있게 구경하세요. 6호선의 녹사평역 : [[10|결혼식장]]\n\n녹사평역은 지붕을 유리로 만들어서 지하 4층까지 아주 밝습니다. 지하철역 벽에 여러 가지 색깔의 유리로 만든 그림이 있어서 아름답고, 유리 계단과 에스컬레이터도 특이합니다. 지하철역이 아주 아름다워서 여기에서 결혼식을 하는 사람들도 많습니다",
  },
  {
    id: "yonsei2-lesson-20",
    lessonNumber: 20,
    lessonLabel: "Bài 20",
    title: "교통과 생활",
    cd: "39",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-20.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-20.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-20.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-39.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-39.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-39.wav", type: "audio/wav" },
    ],
    clozeText: "어느 날 [[1|버스]]나 [[2|지하철]]이 모두 사라지면 어떻게 학교에 오겠습니까? [[3|비행기]]가 없으면 우리는 언제 [[4|고향]]에 계신 [[5|부모님]]을 다시 만날 수 있을까요? 우리가 날마다 이용하는 [[6|교통수단]]이 없으면 우리의 생활은 지금과 아주 다를 것 같습니다.\n\n교통수단이 많지 않은 [[7|옛날]]에 사람들은 어디까지 갈 수 있었을까요? 소나 말을 타고 옆 마을의 산에 갔다가 집으로 돌아오는 것은 하루 종일 걸리는 피곤한 일이었습니다 친구를 만나러 고향에 가고 싶어도 산을 넘고 강을 건너는 [[8|여행]]이 힘들어서 보고 싶을 얼굴을 생각만 했겠지요.\n\n그때 사람들은 우리가 날마다 지하철을 타고 산을 지나서 학교에 다니는 것을 상상할 수 있었을까요? 친구가 보고 싶으면 언제든지 [[9|KTX]]를 타고 고향에 가서 재미있게 놀다가 오는 것도 어려운 일이 아니지요.\n\n여러분은 어떻습니까? 미래의 사람들이 엘리베이터를 타고 [[10|우주]]까지 가는 것을 생각해 본 적이 있나요? 앞으로 저는 우주에서 조용하고 자유롭게 살았으면 좋겠습니다 친구들을 만날 때는 자가용 우주선을 타고 지구로 오겠습니다. 또 친구들이 우주에 놀러 오면 함께 우주 버스를 타고 구경도 하고 파란 바다가 아름다운 지구의 사진도 찍겠습니다.\n\n앞으로 교통수단은 어떻게 달라질까요? 그러면 우리들의 생활은 어떻게 될까요?",
  },
  {
    id: "yonsei2-lesson-21",
    lessonNumber: 21,
    lessonLabel: "Bài 21",
    title: "학술정보관",
    cd: "41",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-21.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-21.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-21.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-41.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-41.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-41.wav", type: "audio/wav" },
    ],
    clozeText: "[[1|학술정보관]]은 올해 새로 문을 연 우리 학교 [[2|도서관]]이다. 새 건물이어서 깨끗하고 이 용하기가 편리하다. [[3|컴퓨터]]로 빈자리를 [[4|예약]]할 수 있고 예약 시간도 정할 수 있다. 그 래서 나는 가끔 학술정보관에 가서 [[5|숙제]]를 하거나 [[6|인터넷]]을 한다.\n\n오늘 나는 언어 교환을 하기로 한 한국 [[7|친구]]를 처음 만났다. 우리는 서로 [[8|취미]]에 대 해서 물어 봤다. 그 친구는 취미가 [[9|영화]] 감상이어서 시간이 있을 때마다 학술정보관에 가서 영화를 본다고 했다.\n\n“거기에 가면 영화를 볼 수 있어요?”\n\n네, 8층에 넓은 멀티미디어센터가 있는데 멀티미디어 자료가 많고 원하는 멀티미디어 자료를 컴퓨터로 빨리 찾을 수 있어요. 나는 거기에서 외국어 공부도 하고 음악도 들어요. 가끔 편한 의자에 앉아서 [[10|헤드폰]]을 쓰고 영화도 봐요. 그렇게 하면 스트레스 가 풀리는 것 같아요. 학기 중에는 1주일에 두 번 멀티미디어센터 안에 있는 영화감상실에서 무료로 영화를 상영해요. 마이클 씨, 금요일 오후에 영화를 상영하는데 같이 가 볼까요?”\n\n우리는 금요일에 멀티미디어센터에 가서 영화를 보기로 했다. ：",
  },
  {
    id: "yonsei2-lesson-22",
    lessonNumber: 22,
    lessonLabel: "Bài 22",
    title: "서비스가 좋은 은행",
    cd: "43",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-22.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-22.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-22.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-43.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-43.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-43.wav", type: "audio/wav" },
    ],
    clozeText: "저는 어제 [[1|통장]]을 만들려고 학교에 있는 [[2|은행]]에 갔어요. 은행 안은 사람이 많아서 좀 복잡했어요. 제가 [[3|번호표]]를 뽑아야 하는 것을 모르고 그냥 [[4|창구]] 앞에 서서 기다리 니까 은행 [[5|안내원]]이 번호표를 뽑아서 줬어요. 번호표를 보니까 제 앞에 기다리는 사람 이 20명쯤 있었어요. 기다리는 것이 지루할 것 같았는데 기다리는 동안 [[6|잡지]]도 보고 텔레비전 뉴스도 보니까 시간이 빨리 갔어요. 의자에 앉아서 잡지를 보다가 제 차례가 돼서 창구로 갔어요. 창구에 가니까 사탕이 많이 있었어요. [[7|직원]]이 사탕을 권해서 하 나 먹었어요.\n\n통장을 만들려면 [[8|외국인등록증]]이 있어야 하는데 저는 외국인등록증을 안 가지고 갔어요. 은행 직원은 친절하게 “외국인등록증이 없으면 [[9|학생증]]과 [[10|여권]]을 보여 주세요” 하 고 말했어요. 저는 학생증과 여권을 보여 줬어요. 그리고 서류에 이름과 연락처를 적고 서명을 했어요. 저는 현금카드가 필요해서 현금카드도 같이 신청했어요. 조금 기다리 니까 통장과 현금카드가 모두 나왔어요.\n\n저는 한국말을 잘 못해서 걱정했는데 쉽게 통장과 현금카드를 만들 수 있어서 기분이 좋았어요. 직원이 친절하고 일을 생각보다 빨리 처리해 줬어요. 한국의 은행은 서비스가 좋은 것 같아요.\n\n격",
  },
  {
    id: "yonsei2-lesson-23",
    lessonNumber: 23,
    lessonLabel: "Bài 23",
    title: "요가 배우기",
    cd: "45",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-23.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-23.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-23.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-45.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-45.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-45.wav", type: "audio/wav" },
    ],
    clozeText: "저는 [[1|한국]]에 사는 동안 한국 사람들도 많이 만나고 한국에 대해서 많이 배우고 싶 었습니다. 그래서 어떻게 하면 좋을지 [[2|방법]]을 찾고 있었습니다. 그런데 얼마 전에 버스 [[3|정류장]]에서 서대문구청의 [[4|문화]] [[5|프로그램]]을 소개하는 [[6|광고]]를 봤습니다. 그 광고에는 '전통무용; '가야금; '떡케이크 만들기' 같은 프로그램이 있었습니다.\n\n저는 아주 기뻐서 서대문구청의 [[7|문화회관]]에 직접 찾아 갔습니다. 그곳의 프로그램은 한 달에 3만 원~6만 원 정도로 값도 별로 비싸지 않았습니다. 배우고 싶은 것이 많았 지만 제가 아직 [[8|한국말]]이 서투르기 때문에 우선 [[9|요가]]를 신청하기로 했습니다. 요가는 선생님의 말씀을 잘 몰라도 다른 학생들을 보고 따라 할 수 있으니까 어렵지 않을 것 같았습니다.\n\n제가 신청한 요가 [[10|수업]]은 화요일과 목요일 저녁에 한 시간 동안 합니다. 같이 요가를 하는 아주머니들은 운동을 아주 좋아하는 것 같습니다. 그리고 이야기하는 것도 좋아 해서 저에게 말을 많이 겁니다.\n\n요즘 한국에서 유행하고 있는 요가를 배우고 아주머니들과 여러 가지 이야기도 많\n\n. 이 하니까 한국이 더 가까워지는 것 같습니다. 요가를 배운 후에는 한국의 전통 문화 도 배웠으면 좋겠습니다.",
  },
  {
    id: "yonsei2-lesson-24",
    lessonNumber: 24,
    lessonLabel: "Bài 24",
    title: "자원봉사",
    cd: "47",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-24.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-24.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-24.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-47.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-47.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-47.wav", type: "audio/wav" },
    ],
    clozeText: "한국 [[1|생활]]에 익숙해지기는 했지만 나는 요즘 게을러지는 것을 느꼈다. 오늘도 특별 히 한 일이 없이 시간을 보냈다. [[2|친구]]들과 커피를 마신 후에 옷가게를 구경했다. 기숙 사 친구에게 이런 이야기를 하니까 친구는 [[3|자원봉사]]에 대해서 이야기해 주었다.\n\n“서울시 [[4|자원봉사센터]]에는 외국인 자원봉사 프로그램이 많아. 나는 요즘 주민 센터 [[5|도서관]]에서 책을 대출해 주는 일을 하고 있어.\"\n\n나는 “아직 [[6|한국말]]을 잘 못하는데 할 수 있을까?\" 하고 걱정이 됐지만 인터넷에서 자 원봉사에 대한 자료를 찾아봤다. [[7|노인]]들에게 점심을 나누어 드리는 일도 있고 아이들에 게 [[8|영어]]를 가르치는 일도 있었다. 또 자원봉사센터에는 도와주는 분들이 많았다. 어려 운 사람들을 도와주려고 시작하는 것이지만 사실 내가 배우는 것이 더 많고 서로 나 누는 기쁨도 클 것 같았다.\n\n나는 일주일에 한 번 [[9|양로원]]에 계신 할머니와 할아버지를 찾아가서 이야기를 해 드 리는 일부터 해 보려고 한다. 내가 외국인이기는 하지만 어려운 노인들과 한 [[10|가족]] 같이 지냈으면 좋겠다.\n\n우리나라에서도 자원봉사를 해 본 적이 없는 내가 한국에서 그런 일을 할 수 있을지 모르겠다. 그래도 내일은 서울시 자원봉사센터에 한번 가 보려고 한다.",
  },
  {
    id: "yonsei2-lesson-25",
    lessonNumber: 25,
    lessonLabel: "Bài 25",
    title: "미영 씨와의 전화",
    cd: "49",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-25.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-25.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-25.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-49.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-49.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-49.wav", type: "audio/wav" },
    ],
    clozeText: "지난주에 한국 [[1|친구]]가 나에게 [[2|미영]] 씨를 소개해 줬다. 나는 모르는 [[3|여자]]를 만나는 것이 겁이 났다. 미영 씨를 처음 만났을 때 너무 떨리고 [[4|한국말]]도 생각이 안 나서 [[5|실수]] 를 많이 했다. 그런데 미영 씨와 헤어진 후에 나는 자꾸 미영 씨가 생각났다. 미영 씨 를 다시 만나고 싶었지만 어떻게 [[6|연락]]을 해야 할지, 무슨 말을 어떻게 해야 할지 몰라 서 오늘도 한참 생각했다.\n\n지금 [[7|전화]]를 할까? 저녁에 [[8|문자]]를 보낼까?'\n\n금요일에 만날까? 아니면 토요일에 만날까?\"\n\n'영화를 보자고 할까? 아니, [[9|오페라]]를 보자고 할까?\"\n\n“따르릉\" 갑자기 전화가 왔다.\n\n\"여보세요?\"\n\n“여보세요? 피터 씨, 저 김미영인데요.\"\n\n“아! 미영 씨, 우리 영화 보러 갈래요?”\n\n나는 깜짝 놀라서 인사도 안 하고 영화를 보러 가자고 했다. 전화기에서 미영 씨의 웃 는 소리가 들렸다. 미영 씨의 [[10|목소리]]는 정말 부드러웠다. 나는 부끄러웠지만 행복했다.",
  },
  {
    id: "yonsei2-lesson-26",
    lessonNumber: 26,
    lessonLabel: "Bài 26",
    title: "전화 예약",
    cd: "51",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-26.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-26.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-26.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-51.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-51.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-51.wav", type: "audio/wav" },
    ],
    clozeText: "오랜만에 [[1|유코]]에게서 전화가 왔다. 유코는 이번 [[2|방학]]에 한국에 오겠다고 했다. 유코 가 나에게 [[3|한국말]]이 많이 늘었냐고 해서 나는 물론이라고 했다.\n\n유코가 같이 여행할 수 있냐고 해서 나는 유코에게 [[4|제주도]]에 가자고 했다. 그리고 비 행기 표 예매와 [[5|호텔]] [[6|예약]]은 내가 한국에서 하겠다고 했다. 나는 [[7|여행사]]에 전화를 하 기 전에 학교에서 배운 여러 가지 표현을 연습했다.\n\n나는 여행사에 전화를 걸어서 먼저 제주도행 [[8|비행기]] 표가 얼마냐고 물어봤다. 그러니 까 여행사 직원이 나에게 일본 사람이냐고 했다. 그 사람은 내가 일본 사람인지 어떻게 알았을까? 내 [[9|발음]]이 이상한가? 발음 연습을 더 열심히 해야겠다. 나는 전화로 이야기 하니까 무슨 말인지 이해하기가 어려웠다. 여행사 직원이 뭐라고 물었는데 나는 잘 몰 라서 답답했다. 전화로 예약하는 것이 힘들어서 여행사에 직접 가겠다고 했다. 내가 여 행사가 어디에 있냐고 물으니까 [[10|신촌]]에 있다고 하는 것 같았다. 나는 시청' 인지, 신촌 인지 다시 한 번 물어봤다.\n\n사람들과 한국말로 이야기할 때 어렵지 않았기 때문에 나는 전화로 예약하는 것도 자신이 있었다. 그런데 전화로 통화하는 것은 직접 만나서 이야기하는 것보다 어려웠\n\n. 유코가 오기 전에 한국말 연습을 많이 해야겠다.",
  },
  {
    id: "yonsei2-lesson-27",
    lessonNumber: 27,
    lessonLabel: "Bài 27",
    title: "부모님과의 화상 통화",
    cd: "53",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-27.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-27.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-27.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-53.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-53.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-53.wav", type: "audio/wav" },
    ],
    clozeText: "저는 한국에 온 지 한 달쯤 됐습니다. [[1|유학]] [[2|생활]]이 재미있기는 하지만 가끔 외로울 때가 있습니다.\n\n저는 외로울 때마다 [[3|인터넷]]으로 [[4|부모님]]과 [[5|화상]] [[6|통화]]를 합니다. 인터넷 화상 통화는 소리도 잘 들리고 화면도 커서 아주 좋습니다. 한국 생활이 힘들거나 부모님이 보고 싶을 때 화상 통화를 하면 기분이 좋아집니다. 화상 통화를 할 때는 부모님이 바로 옆 에 계시는 것 같습니다. 부모님은 제 한국 생활에 대해서 많이 알고 싶어하십니다 항 상 저에게 어떻게 지내냐고 하시고 필요한 것은 없냐고 물어보십니다. 그리고 늘 열심 히 공부하라고 하십니다.\n\n얼마 전에 저는 몸이 많이 아팠습니다. [[7|어머니]]께서 제 모습을 보고 걱정하실 것 같아 서 화장을 하고 통화를 했는데 어머니 얼굴을 보니까 갑자기 [[8|눈물]]이 났습니다. 어머니 가 저를 보고 왜 우냐고 하셔서 저는 너무 반가워서 운다고 했습니다. 울고 있는 저를 보고 어머니도 같이 우셨습니다. 저는 그때 이번 [[9|방학]]에 고향에 갈 거라고 했습니다 제가 고향에 가면 어머니는 맛있는 [[10|음식]]을 많이 만들어 주겠다고 하셨습니다. 빨리 방 학이 돼서 부모님을 만났으면 좋겠습니다.",
  },
  {
    id: "yonsei2-lesson-28",
    lessonNumber: 28,
    lessonLabel: "Bài 28",
    title: "단짝 친구",
    cd: "55",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-28.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-28.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-28.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-55.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-55.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-55.wav", type: "audio/wav" },
    ],
    clozeText: "저와 [[1|지민]]이는 [[2|단짝]] [[3|친구]]입니다. 지민이는 [[4|아침]]에 눈을 뜨면 저부터 찾습니다. 저는 지민이와 같이 자는데 가끔은 제가 아침에 [[5|노래]]를 불러서 지민이를 깨워 줍니다.\n\n지민이는 어디에 가든지 저를 데리고 갑니다. 가끔 깜박 잊어버리고 저를 안 데리 고 가면 우리는 둘 다 하루 종일 불안해합니다. 우리는 언제나 [[6|손]]을 잡고 다닙니다. 지민이는 [[7|이야기]]하는 것을 좋아해서 저에게 언제나 이야기를 많이 합니다. 그리고 저 는 이야기를 듣는 것을 좋아해서 우리는 아주 잘 맞습니다.\n\n그런데 지민이는 저보다 머리가 좀 나빠서 똑같은 것을 자꾸 물어 봅니다. 윤아의 [[8|전화번호]]가 몇 번이냐고 묻고, 어제 배운 단어 '저울 이 무슨 뜻이냐고 묻고, 볼펜 5 개에 1.200원이면 한 개에 얼마냐고 묻습니다. 제가 친절하게 다 가르쳐 주니까 지민 이는 생각을 더 안 하는 것 같습니다.\n\n이렇게 생각하기를 싫어하는 지민이도 제 생각을 정말 많이 해 줍니 다. 지난주에 날씨가 좀 추워져서 지민이가 선물로 예쁜 [[9|스웨터]]와 목 도리를 사 주었습니다. 그래서 저도 다음 지민이 [[10|생일]]에 불러주려고 최신 노래를 열심히 연습하고 있습니다.\n\n여러분, 저와 지민이가 부럽죠? *%^^*",
  },
  {
    id: "yonsei2-lesson-29",
    lessonNumber: 29,
    lessonLabel: "Bài 29",
    title: "국제진료센터",
    cd: "57",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-29.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-29.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-29.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-57.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-57.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-57.wav", type: "audio/wav" },
    ],
    clozeText: "나는 지금까지 심하게 아픈 적도 없고 [[1|병원]]에 간 적도 별로 없다.\n\n그런데 지난 [[2|수요일]]에 학교에서 갑자기 [[3|배]]가 아프기 시작했다. 그래서 [[4|수업]]이 끝나고 [[5|기숙사]]에 돌아와서 쉬었다. 저녁 때가 되니까 배가 더 아프고 설사도 여러 번 했다. 기 숙사 [[6|방친구]]가 어디가 아프냐고 해서 증상을 말하니까 약을 사 가지고 왔다. 그 약을 먹었지만 별로 낫지 않아서 밤에는 잠도 잘 못 잤다.\n\n다음 날 아침에 방친구가 병원에 같이 가자고 했다. 나는 [[7|한국말]]도 잘 못하고 어디에 가서 어떻게 해야 하는지 몰랐는데 정말 고마웠다. 방친구는 한국에 온 지 일 년이 지 나서 한국생활에 아주 익숙하다. 우리는 세브란스병원의 [[8|국제진료센터]]로 갔다. 거기는 모든 서류가 영어로 되어 있고 선생님도 영어로 설명해 주셔서 참 편했다. 선생님은 뭐 잘못 먹은 것은 없었냐, 최근에 뭘 먹었냐 등 몇 가지 질문을 한 후에 [[9|검사]]를 하자고 하셨다\n\n1시간쯤 후에 결과가 나왔는데 [[10|장염]]이라고 하셨다. 주사를 맞고 약국에 가서 3일분 의 약을 받아 가지고 왔다. 약을 먹고 2~3일 쉬니까 좀 괜찮아졌다. 큰 병은 아니지만\n\n아프니까 가족들 생각이 많이 났다. 빨리 나아서 맛있는 음식을 먹었으면 좋겠다.",
  },
  {
    id: "yonsei2-lesson-30",
    lessonNumber: 30,
    lessonLabel: "Bài 30",
    title: "한의원에서의 신기한 경험",
    cd: "59",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-30.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-30.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-30.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-59.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-59.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-59.wav", type: "audio/wav" },
    ],
    clozeText: "나는 오늘 친구들과 [[1|농구]]를 하다가 넘어졌다. 너무 아파서 걷기도 힘들었다.\n\n친구는 그렇게 아플 때는 [[2|한의원]]에 가서 [[3|침]]을 맞는 게 좋다고 했다. 나는 침이라는 말을 처음 들어서 친구에게 침이 뭐냐고 물어 봤다. 친구는 침은 [[4|바늘]] 같이 생긴 것인 데 침을 맞으면 빨리 나을 수 있다고 했다. 작년에 [[5|스키장]]에서 스키를 타다가 넘어졌을 때 한의원에 가서 침을 맞고 나았다고 했다. 친구는 학교 근처에 있는 유명한 한의원에 같이 가 보지 않겠냐고 했다.\n\n나는 친구와 같이 한의원에 갔다. 한의사 [[6|선생님]]은 이것저것 물어 보시고 [[7|발목]]을 만 져 보셨다. 한의사 선생님은 나에게 발목을 많이 삐었으니까 침을 맞아야 한다고 하셨 다. 그리고 발목이 많이 부었으니까 [[8|찜질]]을 하라고 하셨다. 내가 [[9|약]]은 안 먹어도 되냐 고 물어보니까 약은 안 먹어도 되고 침만 몇 번 더 맞으면 된다고 하셨다. 그리고 며칠 동안은 많이 걷지 말고 쉬라고 하셨다.\n\n나는 침을 맞기 전에 [[10|긴장]]을 많이 했는데 다행히 침을 맞을 때 별로 아프지 않았다. 30분쯤 지나니까 좀 좋아지는 것 같았다. 아주 신기했다.",
  },
  {
    id: "yonsei2-lesson-31",
    lessonNumber: 31,
    lessonLabel: "Bài 31",
    title: "쉽게 할 수 있는 스트레칭",
    cd: "61",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-31.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-31.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-31.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-61.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-61.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-61.wav", type: "audio/wav" },
    ],
    clozeText: "공부하다가 힘들 때 [[1|건강]]을 위한 [[2|스트레칭]]을 해 보면 어떨까요? 다음은 여러분이 [[3|의자]]에 앉아서 할 수 있는 스트레칭입니다. 가벼운 기분으로 따라해 보세요.\n\n때왼손으로 [[4|머리]] 오른쪽을 잡습니다. 머리를 왼쪽으로 당기세요. [[5|오른손]]은 아래로 쪽 뻔어 의 자를 잡습니다. 마음 속으로 열까지 셉니다. 이 [[6|동작]]을 세 번 반복합니다. 반대쪽도 같은 동 작을 세 번 합니다.\n\n떤의자에 똑바로 앉습니다. 오른쪽 다리를 굽혀서 [[7|발목]]을 왼쪽 다리 위에 올려 놓습니다. 오른 쪽 발목으로 천천히 동그라미 그리기를 열 번 반복합니다. 반대쪽도 같은 동작을 열 번 반 복합니다.\n\n두 손을 빨리 비벼서 따뜻해지게 합니다. 두 손을 양쪽 눈에 대고 [[8|손끝]]으로 천천히 눌러 줍 니다. 오랜 시간 동안 책을 본 후에 눈이 피곤해졌을 때 이렇게 하면 좋습니다.\n\n0허리를 펴고 똑바로 앉습니다. 두 손을 잡고 팔을 앞쪽으로 쪽 뻔습니다. 이때 손바닥이 밖 으로 향하게 합니다. 마음 속으로 열까지 센 후에 팔을 내립니다. 다시 두 팔을 위로 뻔고\n\n열을 셉니다. [[9|손목]]을 천천히 동그라미를 그리는 것처럼 열 번 돌립니다.\n\n오랜 시간 앉아서 공부하기가 얼마나 힘듭니까? 쉬는 시간에 이 스트레칭을 하면 건강도 지키고 [[10|성적]]도 올릴 수 있을 것입니다.",
  },
  {
    id: "yonsei2-lesson-32",
    lessonNumber: 32,
    lessonLabel: "Bài 32",
    title: "건강 보험",
    cd: "63",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-32.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-32.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-32.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-63.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-63.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-63.wav", type: "audio/wav" },
    ],
    clozeText: "는 [[1|감기]]에 걸려서 그저께부터 [[2|열]]이 나는 데다가 [[3|머리]]도 아팠다. 유미 씨도 [[4|기침]]이 심해서 우리는 같이 [[5|병원]]에 갔다. 우리는 먼저 체온을 재고 기다리다가 진료를 받았다.\n\n는 [[6|진료비]]가 생각보다 많이 나와서 깜짝 놀랐다. 유미 씨에게 진료비가 너무 비싸 지 않냐고 했다. 유미 씨는 진료비가 비싸기는 하지만 여행자 [[7|보험]]에 들어서 괜찮다고 했다.\n\n“여행자 보험요?”\n\n나는 여행자 보험에 대해서 아는 것이 없었는데 유미 씨가 잘 설명해 줬다. 여행자 보 험에 들면 진료를 받은 후에 [[8|영수증]]을 가지고 보험 회사에 가서 진료비를 돌려받을 수 있다고 한다. 한국에도 보험 회사가 많다고 하니까 한번 알아 봐야겠다.\n\n우리의 이야기를 듣고 간호사는 나에게 건강 보험에 대해서 가르쳐줬다. 나는 건강 보험 이야기도 처음 들었다. 한국에 사는 외국인들도 외국인등록증을 가지고 건강보 험공단에 가면 [[9|국민건강보험]]에 들 수 있다고 한다. 그리고 유학생이면 [[10|보험료]]가 비싸지 않다고 했다.\n\n나는 비싼 진료비를 생각하니까 머리가 더 아픈 것 같았다. 싸게 진료를 받는 방법을 모르고 돈을 많이 내서 아까웠다. 어떤 보험이 좋은지 알아봐야겠다.",
  },
  {
    id: "yonsei2-lesson-33",
    lessonNumber: 33,
    lessonLabel: "Bài 33",
    title: "혼자 떠나는 여행",
    cd: "65",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-33.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-33.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-33.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-65.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-65.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-65.wav", type: "audio/wav" },
    ],
    clozeText: "저는 [[1|방학]] 때 한국의 여러 곳을 구경하고 학교에서 배운 [[2|한국말]]을 연습하기 위해 서 한국에서 2주일 동안 [[3|여행]]을 한 적이 있어요. 혼자 자유롭게 여행을 하고 싶어서 계획을 세우지 않고 [[4|여행책자]]만 사 가지고 여행을 떠났어요.\n\n한국에서 혼자 하는 여행이어서 긴장이 됐는데 [[5|여행지]] 사람들은 모두 친절했어요. 사람들은 내 서투른 한국말을 잘 들어주고 길도 잘 가르쳐 줬어요.\n\n저는 거의 날마다 [[6|찜질방]]에서 잤어요. 찜질방은 값도 싸고 쉽게 찾을 수 있어서 편 리했어요. [[7|일본]]에도 한국 같은 찜질방이 있었으면 좋겠어요.\n\n저는 가끔 돈을 아끼려고 지나가는 차를 얻어 타기도 했어요. 어느 날 저는 차를 얻어 타려고 한 30분 정도 기다리고 있었는데 어떤 [[8|트럭]] 아저씨가 지나가다가 차를 세우고 그 트럭을 타라고 하셨어요. 그 아저씨는 음료수도 주시고 내가 가고 싶은 곳 까지 데려다 주셨어요.\n\n또 하나 기억이 나는 일은 [[9|동해]]에 갔을 때 어떤 학생을 만난 일이에요. 그 한국 대학생은 군대에 가기 전에 혼자 여행을 하고 싶어서 부산에서 왔다고 했어요. 우리 는 동해 바닷가에 앉아서 파도 소리도 듣고 같이 술도 마셨어요. 일본과 한국의 다 른 점에 대한 이야기도 하고 우리의 [[10|미래]]에 대한 이야기도 했어요. 지금 그 학생은 무엇을 하고 있을까? 가끔 생각이 나요.\n\n한국말이 서툴러서 고생하기는 했지만 한국의 여러 곳에서 많은 것을 직접 배울 수 있는 좋은 시간이었어요.\n\n※ 일본 학생의 글",
  },
  {
    id: "yonsei2-lesson-34",
    lessonNumber: 34,
    lessonLabel: "Bài 34",
    title: "꿈 같은 세계 여행",
    cd: "67",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-34.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-34.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-34.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-67.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-67.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-67.wav", type: "audio/wav" },
    ],
    clozeText: "저는 어렸을 때부터 [[1|해외여행]]을 많이 했습니다. 저희 [[2|아버지]]께서는 사업을 하셨는데 외국으로 출장을 가시는 일이 많았습니다. 그래서 가끔 저도 아버지를 따라서 [[3|세계]] 여 러 나라로 여행을 갈 기회가 있었습니다\n\n제가 아버지를 따라서 처음 갔던 곳은 [[4|두바이]]였습니다. 두바이는 아랍에미리트의 도 시인데 크고 아름다운 [[5|건물]]이 많았습니다. 그곳은 날씨가 너무 더워서 다니기가 힘들 었지만 모든 건물 안은 시원했고 호텔 방에는 [[6|수영장]]도 있었습니다.\n\n또 저는 10살 때 [[7|미국]]으로 여행을 갔습니다. 그 때 마이클 잭슨의 [[8|콘서트]]가 있었는데 저는 그 콘서트에서 제 티셔츠에 마이클 잭슨의 사인을 받았습니다. 그 옷은 제 보물 1 호입니다. 미국에서 한 달쯤 있었는데 마지막 주에 [[9|교통사고]]가 나서 저는 3일 동안 병원 에 입원해 있었습니다. 그 때 저를 치료해 주신 스미스 선생님과 요즘도 연락합니다.\n\n대학교 1학년 때 갔던 [[10|브라질]]도 기억에 남습니다. 저는 아마존 강에서 며칠 동안 보트를 탔습니다. 강에서는 언제 무슨 일이 생길 지 몰라서 저는 좀 무서웠지만 그곳 사람들은 전혀 걱정을 하지 않아서 놀랐습니다. 아마존에서 본 나무와 신기한 동물들도 잊을 수 없습니다.\n\n가족들과 같이 자동차 여행을 했던 스페인, 모래에서 스노보드를 탔던 페루, 다른 문화를 볼 수 있었던 인도 등 여러 나라에서 정말 많은 것을 배우고 느꼈습니다\n\n※ 학생이 발표한 이야기를 글로 엮은 것",
  },
  {
    id: "yonsei2-lesson-35",
    lessonNumber: 35,
    lessonLabel: "Bài 35",
    title: "여행 계획",
    cd: "69",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-35.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-35.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-35.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-69.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-69.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-69.wav", type: "audio/wav" },
    ],
    clozeText: "이제 곧 신나는 [[1|방학]]입니다. 이번 방학에는 무엇을 하겠습니까? 여러분이 꿈꾸던 여 행을 떠나지 않겠습니까?\n\n자, 그럼 지금부터 [[2|여행]] [[3|계획]]을 세워 봅시다. 즐거운 여행을 하기 위해서 여행 계획만 큼 중요한 것은 없습니다. 여행 계획을 세우기 위해서 무엇을 해야 할까요? 우선 여행 을 가서 무엇을 하고 싶은지 정해야 합니다. [[4|관광]], [[5|휴식]], [[6|문화]] 학습, 새로운 체험 등 여 행의 목적이 무엇인지 먼저 생각해야겠지요. 다음으로 정해진 [[7|경비]]에 맞춰서 [[8|여행지]], 여행 기간, 교통편, 숙박 시설을 알아봅니다.\n\n여행지를 결정하면 다음으로 그곳에 대한 정보를 찾아봅니다. 가려고 하는 곳의 날씨, 음식, 물가, 볼거리 등에 대해서 알아봅니다. 여행 안내서나 [[9|인터넷]]에서 찾은 정보, 또는 주변 사람들에게서 들은 여행지 정보를 가지고 일정을 짜세요. 정확한 정보를 가지고 일정을 잘 짜서 떠나면 경비도 아낄 수 있고 더 즐거운 시간도 보내게 될 것입니다.\n\n일정이 정해지면 교통편, 숙박 시설을 예약하고 필요한 경우에 [[10|여권]]과 비자도 준비하 세요. 마지막으로 짐을 쌉니다. 여행지의 날씨에 맞는 옷과 세면 도구, 두통약이나 소화 제 등 필요한 약을 준비하세요.\n\n드디어 수업이 끝나는 날, 친구들과 인사를 한 후에 기다리고 기다리던 여행을 떠나 세요!",
  },
  {
    id: "yonsei2-lesson-36",
    lessonNumber: 36,
    lessonLabel: "Bài 36",
    title: "추천하고 싶은 여행지",
    cd: "71",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-36.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-36.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-36.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-71.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-71.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-71.wav", type: "audio/wav" },
    ],
    clozeText: "한국에서 [[1|여행]]을 해 봤습니까? \"한국 하면 어디가 생각납니까? [[2|제주도]], [[3|설악산]], [[4|경주]] 에 대해서 잘 알고 있을 겁니다. [[5|자연]]의 아름다움, 특히 나무와 숲을 좋아하는 사람에 게 저는 [[6|보성]]의 [[7|녹차]] 밭과 담양의 [[8|대나무]] 숲을 추천하고 싶습니다.\n\n보성의 녹차 밭은 경치가 아름다워서 영화와 드라마를 많이 찍은 곳입니다. 넓은 차 밭의 초록빛이 얼마나 아름다운지 모릅니다. 해마다 5월에 차축제가 열리는데 그때는 찻잎 따기, 차 만들기, 다도 배우기 [[9|행사]]가 있습니다. 보성은 녹차 삼겹살이 유명하고 근처에 해수욕장이 있어서 바다도 같이 즐길 수 있습니다.\n\n담양은 조용히 대나무 숲을 산책하려고 하는 사람들에게 좋은 곳입니다. 시원한 바 람 소리도 들고 대나무 숲길도 걸으면 기분이 좋아질 겁니다. 그리고 대나무 숲에서 나\n\n는 깨끗한 공기를 마시고 명상하면 머리도 맑아지고 스트레스도 풀릴 겁니다.\n\n한 번에 두 곳을 다 가 보고 싶으면 여행사 단체 관광 상품을 이용하는 게 좋습니 다. 용산역에서 [[10|KTX]]를 타면 정읍역까지 3시간 30분쯤 걸립니다. 거기에서 여행사 버스 를 타고 두 곳을 구경하면 시간도 아낄 수 있고 여행 경비도 많이 들지 않습니다. 하루 에 갔다가 올 수 있으니까 주말에 한번 가 보세요.",
  },
  {
    id: "yonsei2-lesson-37",
    lessonNumber: 37,
    lessonLabel: "Bài 37",
    title: "방 청소",
    cd: "73",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-37.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-37.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-37.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-73.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-73.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-73.wav", type: "audio/wav" },
    ],
    clozeText: "저는 혼자 [[1|자취]]를 하는 남학생입니다. 자취 [[2|생활]]은 자유롭기는 하지만 집이 항 상 지저분한 것이 문제예요. 그렇지만 게으른 저는 [[3|청소]]하는 것을 싫어합니다. 집 에 들어오면 아무 것도 하고 싶지 않습니다. 학교에서 돌아오면 피곤해서 [[4|침대]]에 누워 있고 싶습니다. 청소를 할까 하다가 더러운 방을 보면 무엇을 어떻게 치워야 할지 모르겠어요. 방이 더러우면 더러울수록 더 청소를 하기 싫어져요. 좀 쉽게 청소하는 방법이 있으면 가르쳐 주세요.\n\n집에 들어가면 우선 [[5|창문]]을 활짝 열어 보세요. 그럼 깨끗하게 청소하고 싶은 기분이 들 거예요. 먼저 바닥에 놓여 있는 큰 [[6|물건]]부터 치우세요. 방이 좀 깨끗 해 보일 거예요. 다음으로 필요가 없는 것은 모두 버리세요. 아끼는 물건이어도 1 년 동안 한 번도 쓴 적이 없으면 버리는 것이 좋아요. 그리고 이제부터 5분 청소 를 시작하세요. 한 가지 일이 끝나면 5분 동안 꼭 청소를 하는 거예요. 예를 들 어 [[7|숙제]]를 한 후에는 5분만 [[8|책상]] 위를 치우세요. 보던 책을 바로 책꽂이에 꽂으 면 깨끗해질 거예요. 피자를 먹은 후에는 바로 상을 치우고 [[9|쓰레기]]를 버리세요. 집에 돌아와서 침대에 눕기 전에 옷을 갈아입고 벗은 옷을 [[10|옷장]] 안에 잘 넣으세 요. 5분이면 다 할 수 있어요. 이렇게 일주일 동안 5분만 청소를 계속 해 보세요.\n\n일주일 후에는 마법같이 깨끗해져 있을 거예요.",
  },
  {
    id: "yonsei2-lesson-38",
    lessonNumber: 38,
    lessonLabel: "Bài 38",
    title: "이사하는 날",
    cd: "75",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-38.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-38.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-38.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-75.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-75.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-75.wav", type: "audio/wav" },
    ],
    clozeText: "저는 한국에 온 지 6개월 됐어요. 제가 한국에 처음 왔을 때 살았던 방은 깨끗하고 처음에는 방 값도 싸서 마음에 들었어요. 그런데 옆 방 사람이 너무 시끄럽고 방 값도 올라서 저는 한 달 전부터 [[1|이사]]해야겠다고 생각했어요.\n\n제가 [[2|기숙사]]에서 살지 [[3|하숙집]]에서 살지 결정을 못하고 있는데 친한 [[4|친구]]가 학교 근 처에 있는 하숙집을 소개해 줬어요. 그 하숙집에 가 보니까 [[5|햇빛]]이 잘 들어서 방이 밝 고 조용했어요. 그리고 [[6|교통편]]도 좋은 데다가 하숙비도 싸서 저는 거기에서 살기로 했 어요.\n\n[[7|이삿짐센터]]를 이용하면 편하게 이사할 수 있지만 저는 짐이 많지 않아서 친구들에게 도와 달라고 부탁했어요. 친구들은 이삿날 아침 일찍 와서 짐 싸는 것과 옮기는 것을 도와줬어요. 친구들과 같이 일을 하니까 별로 힘들지 않고 재미있었어요. 우리는 콜택 시로 짐을 옮겼어요. 새 하숙집까지 [[8|택시]]로 15분밖에 걸리지 않았어요.\n\n우리는 짐을 정리한 후 [[9|중국집]]에서 [[10|자장면]]과 탕수육을 배달시켜서 먹었어요. 일을 하고 먹어서 그런지 정말 맛있었어요. 하숙집 아주머니가 써 주신 수박도 아주 맛있 었어요. 이사하기 전에 걱정을 많이 했는데 친구들이 도와줘서 이사가 무사히 잘 끝났 어요. 제가 어렵고 힘들 때마다 저를 도와주는 친구들이 정말 고마워요. 저는 한국에\n\n서 사는 동안 친구들과 좋은 추억을 많이 쌓고 싶어요,",
  },
  {
    id: "yonsei2-lesson-39",
    lessonNumber: 39,
    lessonLabel: "Bài 39",
    title: "로봇과 생활",
    cd: "77",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-39.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-39.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-39.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-77.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-77.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-77.wav", type: "audio/wav" },
    ],
    clozeText: "[[1|할머니]]께서는 가끔 우리 집에 오시는데 오시면 늘 같은 이야기를 하신다. 세상 참 좋 아졌다고. 할머니께서 어렸을 때는 [[2|수도]]나 [[3|전기]] 같은 것이 없어서 직접 불을 피워서 밥 을 하고 강에 가서 손으로 [[4|빨래]]를 했다고 한다. 그래서 할머니는 하루 종일 [[5|집안일]]을 하셨다고 하는데 나는 그런 할머니의 생활을 상상도 할 수 없다.\n\n내가 어렸을 때는 [[6|세탁기]]나 [[7|청소기]] 같은 여러 가지 가전제품이 있어서 편하기는 했지 만 사람이 하나하나 직접 작동해야 했다.\n\n그런데 요즘은 모든 기능을 가진 가사 [[8|로봇]]이 집안일을 다 알아서 해 준다. 여러 가 지 [[9|센서]]를 가진 이 로봇은 청소를 하면서 집안의 공기도 깨끗하게 해 준다. 그리고 옷 장을 열고 레이저로 물도 없이 더러운 옷을 깨끗하게 세탁한다. 이 로봇은 내 기분이 나 건강 상태를 보고 내가 먹고 싶은 음식을 광센서로 10분 만에 요리해 준다. 그리고 내가 음식을 다 먹으면 그릇도 나노센서로 닦는다.\n\n몇 주 전에는 새로 나온 마사지 프로그램을 사서 넣었는데 어깨, 팔, 다리도 아주 잘 주무른다. 다림질 프로그램도 추가해 보니까 세탁소 아저씨보다 다림질도 더 잘 한다. 내가 원하는 것을 알아서 해 주는 로봇이 있으니까 귀찮은 집안일을 아무 문제없이 다 할 수 있다\n\n사람들은 이 로봇 때문에 요즘은 혼자 사는 것이 편해졌다고 한다. 나는 다른 사람 들과 있는 것보다 이 로봇과 있는 것이 훨씬 더 좋다. 다음 달에는 [[10|생활비]]를 아껴서 새 로 나온 프로그램을 더 사야겠다.",
  },
  {
    id: "yonsei2-lesson-40",
    lessonNumber: 40,
    lessonLabel: "Bài 40",
    title: "다양한 집안일 도우미",
    cd: "79",
    audioSources: [
      { src: "/yonsei-listening-2/lesson-40.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/lesson-40.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/lesson-40.wav", type: "audio/wav" },
      { src: "/yonsei-listening-2/cd-79.mp3", type: "audio/mpeg" },
      { src: "/yonsei-listening-2/cd-79.m4a", type: "audio/mp4" },
      { src: "/yonsei-listening-2/cd-79.wav", type: "audio/wav" },
    ],
    clozeText: "지난주에 친한 한국 [[1|친구]]가 [[2|아기]]를 낳아서 친구들과 아기 옷을 사 가지고 친구 집에 놀 러 갔습니다.\n\n아기를 낳은 친구는 얼굴도 좀 붓고 힘들어 보였습니다. 한국에서는 아기를 낳으면 1주 일 정도는 [[3|목욕]]도 하지 않고 [[4|집안일]]도 잘 하지 않는다고 합니다. 친구 집에는 친구의 어머 니같이 보이는 분이 아기를 돌보고 계셨습니다.\n\n“[[5|어머니]]이셔?\"\n\n“아니야, [[6|산후]] [[7|도우미]]이셔. 예전에는 어머니들이 산후에 산모와 아기를 도와주셨는데 요 즘은 전문적으로 이런 일을 해 주시는 분들이 많아. 어머니가 도와주시면 제일 좋겠지만 우리 어머니도 요즘 건강이 안 좋으셔서 산후 도우미를 불렀어.\"\n\n내가 우리나라에는 이런 직업이 없다고 하니까 친구들이 한국에 있는 여러 종류의 도 우미에 대해서 이야기해 주었습니다.\n\n“우리 집에도 일주일에 두 번 집안일을 도와주는 [[8|가사]] 도우미가 와. 부부가 다 일을 하 는 집에서는 바쁜 엄마와 아빠를 위해서 아이를 돌보는 [[9|육아]] 도우미도 많이 쓴다고 해.\"\n\n“맞아. 아픈 사람을 돌보는 [[10|간병인]]도 있지. 요즘은 장을 봐 주는 쇼퍼도 있어\"\n\n“나도 전에 아팠을 때 약을 사러 가기가 힘들어서 심부름 도우미를 부른 적이 있어. 그 도 우미는 전등 바꾸기 같은 여자들이 하기 어려운 일도 도와준다고 했어. 아, 그리고 우리 아파트 윗집에 사는 사람은 바쁠 때 애완동물을 산책시켜 주는 애완동물 산책 도우미를 불러.”\n\n한국에 참 여러 종류의 도우미가 있다는 것을 알게 되었습니다. 우리나라에도 이런 도\n\n도우미가 있었으면 좋겠습니다.",
  },
];

const topikReadingTests: TopikReadingTest[] = [
  {
    id: "topik91-reading",
    title: "TOPIK II 읽기 - Kỳ 91",
    session: "제91회",
    sourceFileName: "topik-91-reading-level-ii.pdf",
    pdfUrl: "/topik/topik-91-reading-level-ii.pdf",
    questionCount: 50,
    readingType: "2교시 읽기",
    note: "Đề TOPIK II đọc kỳ 91, B 홀수형, gồm 50 câu. File là PDF scan/ảnh nên hiển thị PDF gốc để giữ nguyên bố cục, chữ Hàn, bảng và hình minh họa.",
    answerKeySource: "TOPIK GUIDE - 제91회 TOPIK II 읽기 정답 및 배점표",
    answerKey: {
      1: "4",
      2: "4",
      3: "1",
      4: "4",
      5: "2",
      6: "3",
      7: "1",
      8: "1",
      9: "4",
      10: "2",
      11: "3",
      12: "2",
      13: "2",
      14: "3",
      15: "2",
      16: "1",
      17: "3",
      18: "1",
      19: "3",
      20: "1",
      21: "3",
      22: "4",
      23: "1",
      24: "4",
      25: "1",
      26: "3",
      27: "1",
      28: "1",
      29: "2",
      30: "3",
      31: "3",
      32: "4",
      33: "2",
      34: "2",
      35: "4",
      36: "4",
      37: "1",
      38: "4",
      39: "1",
      40: "3",
      41: "3",
      42: "2",
      43: "1",
      44: "3",
      45: "4",
      46: "2",
      47: "2",
      48: "4",
      49: "2",
      50: "4"
    },
  },
  {
    id: "topik96-reading",
    title: "TOPIK II 읽기 - Kỳ 96",
    session: "제96회",
    sourceFileName: "TOPIK 96 읽기 (level II).pdf",
    pdfUrl: "/topik/topik-96-reading-level-ii.pdf",
    questionCount: 50,
    readingType: "2교시 읽기",
    note: "Đề TOPIK II đọc kỳ 96, B 홀수형, gồm 50 câu. File có nhiều phần hình/biểu đồ nên hiển thị PDF gốc để giữ đúng nội dung.",
    answerKeySource: "TOPIK GUIDE - 제96회 TOPIK II 읽기 정답 및 배점표",
    answerKey: {
      1: "4",
      2: "1",
      3: "1",
      4: "4",
      5: "2",
      6: "4",
      7: "1",
      8: "1",
      9: "3",
      10: "2",
      11: "4",
      12: "4",
      13: "2",
      14: "3",
      15: "1",
      16: "1",
      17: "3",
      18: "1",
      19: "4",
      20: "2",
      21: "2",
      22: "3",
      23: "2",
      24: "1",
      25: "3",
      26: "3",
      27: "4",
      28: "4",
      29: "2",
      30: "4",
      31: "3",
      32: "3",
      33: "1",
      34: "2",
      35: "3",
      36: "4",
      37: "3",
      38: "1",
      39: "1",
      40: "3",
      41: "2",
      42: "3",
      43: "1",
      44: "2",
      45: "4",
      46: "2",
      47: "2",
      48: "3",
      49: "4",
      50: "4"
    },
  },
  {
    id: "topik99-reading",
    title: "TOPIK II 읽기 - Kỳ 99",
    session: "제99회",
    sourceFileName: "TOPIK 99 읽기 (level II).pdf",
    pdfUrl: "/topik/topik-99-reading-level-ii.pdf",
    questionCount: 50,
    readingType: "읽기",
    note: "Đề đọc kỳ 99 trong tài liệu Tổng ôn TOPIK. Giữ PDF gốc để bảo toàn chữ Hàn, câu hỏi, bảng và hình minh họa.",
    answerKeySource: "Đáp án tham khảo ở cuối file TOPIK 99 읽기",
    answerKey: {
      1: "2",
      2: "3",
      3: "1",
      4: "4",
      5: "2",
      6: "1",
      7: "1",
      8: "2",
      9: "4",
      10: "3",
      11: "2",
      12: "4",
      13: "3",
      14: "2",
      15: "3",
      16: "1",
      17: "4",
      18: "1",
      19: "1",
      20: "3",
      21: "3",
      22: "2",
      23: "2",
      24: "1",
      25: "1",
      26: "2",
      27: "2",
      28: "3",
      29: "3",
      30: "3",
      31: "2",
      32: "2",
      33: "3",
      34: "1",
      35: "2",
      36: "2",
      37: "3",
      38: "1",
      39: "1",
      40: "4",
      41: "2",
      42: "2",
      43: "4",
      44: "4",
      45: "2",
      46: "4",
      47: "1",
      48: "4",
      49: "4",
      50: "3"
    },
  },
  {
    id: "topik102-reading",
    title: "TOPIK II 읽기 - Kỳ 102",
    session: "제102회",
    sourceFileName: "제102회_문제지 TOPIK2_2교시_읽기_탑재용.pdf",
    pdfUrl: "/topik/topik-102-reading-level-ii.pdf",
    questionCount: 50,
    readingType: "2교시 읽기",
    note: "Đề TOPIK II đọc kỳ 102 bản 탑재용. Đây là PDF scan/ảnh, vì vậy xem trực tiếp PDF là cách chính xác nhất.",
    answerKeySource: "TOPIK GUIDE - 제102회 TOPIK II 읽기 정답 및 배점표",
    answerKey: {
      1: "1",
      2: "1",
      3: "4",
      4: "4",
      5: "1",
      6: "3",
      7: "2",
      8: "1",
      9: "2",
      10: "4",
      11: "2",
      12: "1",
      13: "1",
      14: "2",
      15: "1",
      16: "2",
      17: "3",
      18: "1",
      19: "1",
      20: "4",
      21: "3",
      22: "3",
      23: "1",
      24: "4",
      25: "2",
      26: "2",
      27: "3",
      28: "4",
      29: "3",
      30: "2",
      31: "4",
      32: "1",
      33: "3",
      34: "4",
      35: "3",
      36: "3",
      37: "4",
      38: "4",
      39: "3",
      40: "2",
      41: "4",
      42: "2",
      43: "3",
      44: "2",
      45: "1",
      46: "3",
      47: "2",
      48: "4",
      49: "4",
      50: "3"
    },
  },
];


type VocabItem = {
  word: string;
  meaning: string;
};

type SentenceChoiceQuestion = {
  sentence: string;
  meaning: string;
  answer: string;
  options: string[];
};

type FillBlankQuestion = {
  sentenceBefore: string;
  sentenceAfter: string;
  meaning: string;
  answer: string;
  acceptedAnswers: string[];
  hint: string;
};

type LessonExerciseData = {
  title: string;
  topic: string;
  vocabulary: VocabItem[];
  sentenceChoiceQuestions: SentenceChoiceQuestion[];
  fillBlankQuestions: FillBlankQuestion[];
};

type LessonSeed = {
  topic: string;
  vocabulary: VocabItem[];
  sentencePatterns: Array<{
    sentence: string;
    meaning: string;
    answer: string;
    options: string[];
  }>;
  fillPatterns: Array<{
    before: string;
    after: string;
    meaning: string;
    answer: string;
    hint: string;
    accepted?: string[];
  }>;
};

type PrebuiltLessonSeed = {
  topic: string;
  vocabulary: VocabItem[];
  sentenceChoiceQuestions: SentenceChoiceQuestion[];
  fillBlankQuestions: FillBlankQuestion[];
};

type LessonSource = LessonSeed | PrebuiltLessonSeed;

const lessonSeeds: Record<string, LessonSeed> = {
  "Sơ cấp 1A|Bài 1": {
    topic: "인사와 소개",
    vocabulary: [
      { word: "안녕하세요", meaning: "xin chào" },
      { word: "안녕히 가세요", meaning: "tạm biệt người ra đi" },
      { word: "안녕히 계세요", meaning: "tạm biệt người ở lại" },
      { word: "감사합니다", meaning: "cảm ơn" },
      { word: "죄송합니다", meaning: "xin lỗi" },
      { word: "이름", meaning: "tên" },
      { word: "학생", meaning: "học sinh / sinh viên" },
      { word: "선생님", meaning: "giáo viên" },
      { word: "사람", meaning: "người" },
      { word: "한국", meaning: "Hàn Quốc" },
      { word: "베트남", meaning: "Việt Nam" },
      { word: "친구", meaning: "bạn bè" },
      { word: "저", meaning: "tôi" },
      { word: "네", meaning: "vâng" },
      { word: "아니요", meaning: "không" },
      { word: "만나다", meaning: "gặp" },
      { word: "반갑다", meaning: "vui được gặp" },
      { word: "입니다", meaning: "là" },
      { word: "입니까", meaning: "có phải là không" },
      { word: "씨", meaning: "anh / chị / bạn, gắn sau tên" },
    ],
    sentencePatterns: [
      {
        sentence: "저는 민수____.",
        meaning: "Tôi là Minsu.",
        answer: "입니다",
        options: ["입니다", "입니까", "안녕하세요", "감사합니다"],
      },
      {
        sentence: "이 사람은 제 ____입니다.",
        meaning: "Người này là bạn của tôi.",
        answer: "친구",
        options: ["친구", "한국", "이름", "네"],
      },
      {
        sentence: "____. 저는 흐엉입니다.",
        meaning: "Xin chào. Tôi là Hương.",
        answer: "안녕하세요",
        options: ["안녕하세요", "안녕히 가세요", "죄송합니다", "아니요"],
      },
      {
        sentence: "선생님, ____.",
        meaning: "Thưa cô/thầy, cảm ơn ạ.",
        answer: "감사합니다",
        options: ["감사합니다", "사람", "베트남", "만나다"],
      },
      {
        sentence: "저는 ____ 사람입니다.",
        meaning: "Tôi là người Việt Nam.",
        answer: "베트남",
        options: ["베트남", "학생", "선생님", "친구"],
      },
      {
        sentence: "민수 씨는 학생____?",
        meaning: "Minsu có phải là học sinh không?",
        answer: "입니까",
        options: ["입니까", "입니다", "씨", "이름"],
      },
      {
        sentence: "____, 저는 학생입니다.",
        meaning: "Vâng, tôi là học sinh.",
        answer: "네",
        options: ["네", "아니요", "죄송합니다", "반갑다"],
      },
      {
        sentence: "만나서 ____.",
        meaning: "Rất vui được gặp.",
        answer: "반갑습니다",
        options: ["반갑습니다", "감사합니다", "안녕히 계세요", "입니다"],
      },
    ],
    fillPatterns: [
      { before: "저는 흐엉", after: ".", meaning: "Tôi là Hương.", answer: "입니다", hint: "là" },
      { before: "제 ", after: "은/는 민수입니다.", meaning: "Tên tôi là Minsu.", answer: "이름", hint: "tên" },
      { before: "저는 ", after: " 사람입니다.", meaning: "Tôi là người Việt Nam.", answer: "베트남", hint: "Việt Nam" },
      { before: "이 사람은 제 ", after: "입니다.", meaning: "Người này là bạn tôi.", answer: "친구", hint: "bạn bè" },
      { before: "선생님, ", after: ".", meaning: "Thưa thầy/cô, cảm ơn ạ.", answer: "감사합니다", hint: "cảm ơn" },
      { before: "", after: ". 저는 학생입니다.", meaning: "Xin chào. Tôi là học sinh.", answer: "안녕하세요", hint: "xin chào" },
      { before: "민수 씨는 학생", after: "?", meaning: "Minsu có phải là học sinh không?", answer: "입니까", hint: "có phải là không" },
      { before: "만나서 ", after: ".", meaning: "Rất vui được gặp.", answer: "반갑습니다", hint: "vui được gặp" },
    ],
  },
  "Sơ cấp 1A|Bài 2": {
    topic: "학교와 물건",
    vocabulary: [
      { word: "학교", meaning: "trường học" },
      { word: "교실", meaning: "phòng học" },
      { word: "책", meaning: "sách" },
      { word: "공책", meaning: "vở" },
      { word: "연필", meaning: "bút chì" },
      { word: "볼펜", meaning: "bút bi" },
      { word: "가방", meaning: "cặp / túi" },
      { word: "책상", meaning: "bàn học" },
      { word: "의자", meaning: "ghế" },
      { word: "칠판", meaning: "bảng" },
      { word: "시계", meaning: "đồng hồ" },
      { word: "컴퓨터", meaning: "máy tính" },
      { word: "사전", meaning: "từ điển" },
      { word: "이것", meaning: "cái này" },
      { word: "그것", meaning: "cái đó" },
      { word: "저것", meaning: "cái kia" },
      { word: "있다", meaning: "có" },
      { word: "없다", meaning: "không có" },
      { word: "무엇", meaning: "cái gì" },
      { word: "어디", meaning: "ở đâu" },
    ],
    sentencePatterns: [
      { sentence: "이것은 ____입니다.", meaning: "Cái này là sách.", answer: "책", options: ["책", "학교", "의자", "시계"] },
      { sentence: "교실에 책상이 ____.", meaning: "Trong phòng học có bàn.", answer: "있습니다", options: ["있습니다", "없습니다", "무엇", "어디"] },
      { sentence: "가방에 공책이 ____.", meaning: "Trong cặp không có vở.", answer: "없습니다", options: ["없습니다", "있습니다", "이것", "저것"] },
      { sentence: "____은 무엇입니까?", meaning: "Cái đó là cái gì?", answer: "그것", options: ["그것", "학교", "볼펜", "교실"] },
      { sentence: "선생님은 ____에 있습니다.", meaning: "Giáo viên ở trường.", answer: "학교", options: ["학교", "연필", "사전", "책"] },
      { sentence: "책은 ____ 위에 있습니다.", meaning: "Sách ở trên bàn học.", answer: "책상", options: ["책상", "가방", "칠판", "컴퓨터"] },
      { sentence: "이것은 한국어 ____입니다.", meaning: "Đây là từ điển tiếng Hàn.", answer: "사전", options: ["사전", "의자", "연필", "저것"] },
      { sentence: "시계는 ____에 있습니까?", meaning: "Đồng hồ ở đâu?", answer: "어디", options: ["어디", "무엇", "있다", "없다"] },
    ],
    fillPatterns: [
      { before: "이것은 ", after: "입니다.", meaning: "Cái này là sách.", answer: "책", hint: "sách" },
      { before: "교실에 책상이 ", after: ".", meaning: "Trong phòng học có bàn.", answer: "있습니다", hint: "có" },
      { before: "가방에 공책이 ", after: ".", meaning: "Trong cặp không có vở.", answer: "없습니다", hint: "không có" },
      { before: "책은 ", after: " 위에 있습니다.", meaning: "Sách ở trên bàn.", answer: "책상", hint: "bàn học" },
      { before: "한국어 ", after: "이/가 있습니다.", meaning: "Có từ điển tiếng Hàn.", answer: "사전", hint: "từ điển" },
      { before: "선생님은 ", after: "에 있습니다.", meaning: "Giáo viên ở trường.", answer: "학교", hint: "trường học" },
      { before: "", after: "은 무엇입니까?", meaning: "Cái đó là cái gì?", answer: "그것", hint: "cái đó" },
      { before: "시계는 ", after: "에 있습니까?", meaning: "Đồng hồ ở đâu?", answer: "어디", hint: "ở đâu" },
    ],
  },
  "Sơ cấp 1A|Bài 3": {
    topic: "생활과 장소",
    vocabulary: [
      { word: "집", meaning: "nhà" },
      { word: "도서관", meaning: "thư viện" },
      { word: "식당", meaning: "nhà ăn / quán ăn" },
      { word: "회사", meaning: "công ty" },
      { word: "은행", meaning: "ngân hàng" },
      { word: "우체국", meaning: "bưu điện" },
      { word: "병원", meaning: "bệnh viện" },
      { word: "시장", meaning: "chợ" },
      { word: "가다", meaning: "đi" },
      { word: "오다", meaning: "đến" },
      { word: "먹다", meaning: "ăn" },
      { word: "마시다", meaning: "uống" },
      { word: "공부하다", meaning: "học" },
      { word: "일하다", meaning: "làm việc" },
      { word: "쉬다", meaning: "nghỉ ngơi" },
      { word: "오늘", meaning: "hôm nay" },
      { word: "내일", meaning: "ngày mai" },
      { word: "어제", meaning: "hôm qua" },
      { word: "아침", meaning: "buổi sáng" },
      { word: "저녁", meaning: "buổi tối" },
    ],
    sentencePatterns: [
      { sentence: "저는 학교에 ____.", meaning: "Tôi đi đến trường.", answer: "갑니다", options: ["갑니다", "옵니다", "먹습니다", "마십니다"] },
      { sentence: "친구는 도서관에서 ____.", meaning: "Bạn học ở thư viện.", answer: "공부합니다", options: ["공부합니다", "쉽니다", "갑니다", "옵니다"] },
      { sentence: "아침에 밥을 ____.", meaning: "Buổi sáng tôi ăn cơm.", answer: "먹습니다", options: ["먹습니다", "마십니다", "일합니다", "쉽니다"] },
      { sentence: "회사에서 ____.", meaning: "Tôi làm việc ở công ty.", answer: "일합니다", options: ["일합니다", "마십니다", "옵니다", "먹습니다"] },
      { sentence: "저녁에 집에서 ____.", meaning: "Buổi tối tôi nghỉ ở nhà.", answer: "쉽니다", options: ["쉽니다", "갑니다", "공부합니다", "마십니다"] },
      { sentence: "저는 ____에 갑니다.", meaning: "Tôi đi ngân hàng.", answer: "은행", options: ["은행", "아침", "오늘", "먹다"] },
      { sentence: "친구가 한국에 ____.", meaning: "Bạn đến Hàn Quốc.", answer: "옵니다", options: ["옵니다", "갑니다", "쉽니다", "먹습니다"] },
      { sentence: "____ 시장에 갑니다.", meaning: "Hôm nay tôi đi chợ.", answer: "오늘", options: ["오늘", "집", "식당", "병원"] },
    ],
    fillPatterns: [
      { before: "저는 학교에 ", after: ".", meaning: "Tôi đi đến trường.", answer: "갑니다", hint: "đi" },
      { before: "도서관에서 ", after: ".", meaning: "Tôi học ở thư viện.", answer: "공부합니다", hint: "học" },
      { before: "아침에 밥을 ", after: ".", meaning: "Buổi sáng tôi ăn cơm.", answer: "먹습니다", hint: "ăn" },
      { before: "회사에서 ", after: ".", meaning: "Tôi làm việc ở công ty.", answer: "일합니다", hint: "làm việc" },
      { before: "저녁에 집에서 ", after: ".", meaning: "Buổi tối nghỉ ở nhà.", answer: "쉽니다", hint: "nghỉ ngơi" },
      { before: "저는 ", after: "에 갑니다.", meaning: "Tôi đi ngân hàng.", answer: "은행", hint: "ngân hàng" },
      { before: "친구가 한국에 ", after: ".", meaning: "Bạn đến Hàn Quốc.", answer: "옵니다", hint: "đến" },
      { before: "", after: " 시장에 갑니다.", meaning: "Hôm nay tôi đi chợ.", answer: "오늘", hint: "hôm nay" },
    ],
  },
  "Sơ cấp 1A|Bài 4": {
    topic: "날짜와 요일",
    vocabulary: [
      { word: "월요일", meaning: "thứ hai" },
      { word: "화요일", meaning: "thứ ba" },
      { word: "수요일", meaning: "thứ tư" },
      { word: "목요일", meaning: "thứ năm" },
      { word: "금요일", meaning: "thứ sáu" },
      { word: "토요일", meaning: "thứ bảy" },
      { word: "일요일", meaning: "chủ nhật" },
      { word: "주말", meaning: "cuối tuần" },
      { word: "날짜", meaning: "ngày tháng" },
      { word: "생일", meaning: "sinh nhật" },
      { word: "수업", meaning: "buổi học / lớp học" },
      { word: "시험", meaning: "kỳ thi" },
      { word: "약속", meaning: "cuộc hẹn" },
      { word: "회의", meaning: "cuộc họp" },
      { word: "오전", meaning: "buổi sáng / AM" },
      { word: "오후", meaning: "buổi chiều / PM" },
      { word: "시", meaning: "giờ" },
      { word: "분", meaning: "phút" },
      { word: "있다", meaning: "có" },
      { word: "없다", meaning: "không có" },
    ],
    sentencePatterns: [
      { sentence: "오늘은 ____입니다.", meaning: "Hôm nay là thứ hai.", answer: "월요일", options: ["월요일", "생일", "시험", "오후"] },
      { sentence: "주말에 약속이 ____.", meaning: "Cuối tuần có cuộc hẹn.", answer: "있습니다", options: ["있습니다", "없습니다", "시", "분"] },
      { sentence: "금요일에 ____이 있습니다.", meaning: "Thứ sáu có kỳ thi.", answer: "시험", options: ["시험", "오전", "날짜", "분"] },
      { sentence: "오전 아홉 ____에 수업이 있습니다.", meaning: "Có lớp lúc 9 giờ sáng.", answer: "시", options: ["시", "분", "요일", "생일"] },
      { sentence: "제 ____은 일요일입니다.", meaning: "Sinh nhật của tôi là chủ nhật.", answer: "생일", options: ["생일", "회의", "수업", "날짜"] },
      { sentence: "토요일에는 수업이 ____.", meaning: "Thứ bảy không có lớp.", answer: "없습니다", options: ["없습니다", "있습니다", "오전", "오후"] },
      { sentence: "____에 회의가 있습니다.", meaning: "Buổi chiều có cuộc họp.", answer: "오후", options: ["오후", "분", "월요일", "주말"] },
      { sentence: "오늘 ____는 5월 9일입니다.", meaning: "Ngày hôm nay là ngày 9 tháng 5.", answer: "날짜", options: ["날짜", "수업", "약속", "시험"] },
    ],
    fillPatterns: [
      { before: "오늘은 ", after: "입니다.", meaning: "Hôm nay là thứ hai.", answer: "월요일", hint: "thứ hai" },
      { before: "주말에 약속이 ", after: ".", meaning: "Cuối tuần có cuộc hẹn.", answer: "있습니다", hint: "có" },
      { before: "금요일에 ", after: "이 있습니다.", meaning: "Thứ sáu có kỳ thi.", answer: "시험", hint: "kỳ thi" },
      { before: "오전 아홉 ", after: "에 수업이 있습니다.", meaning: "Có lớp lúc 9 giờ sáng.", answer: "시", hint: "giờ" },
      { before: "제 ", after: "은 일요일입니다.", meaning: "Sinh nhật của tôi là chủ nhật.", answer: "생일", hint: "sinh nhật" },
      { before: "토요일에는 수업이 ", after: ".", meaning: "Thứ bảy không có lớp.", answer: "없습니다", hint: "không có" },
      { before: "", after: "에 회의가 있습니다.", meaning: "Buổi chiều có cuộc họp.", answer: "오후", hint: "buổi chiều" },
      { before: "오늘 ", after: "는 5월 9일입니다.", meaning: "Ngày hôm nay là ngày 9 tháng 5.", answer: "날짜", hint: "ngày tháng" },
    ],
  },
  "Sơ cấp 1A|Bài 5": {
    topic: "하루 일과",
    vocabulary: [
      { word: "일어나다", meaning: "thức dậy" },
      { word: "세수하다", meaning: "rửa mặt" },
      { word: "아침을 먹다", meaning: "ăn sáng" },
      { word: "학교에 가다", meaning: "đi học" },
      { word: "공부하다", meaning: "học" },
      { word: "운동하다", meaning: "tập thể dục" },
      { word: "숙제하다", meaning: "làm bài tập" },
      { word: "쉬다", meaning: "nghỉ ngơi" },
      { word: "자다", meaning: "ngủ" },
      { word: "보다", meaning: "xem / nhìn" },
      { word: "듣다", meaning: "nghe" },
      { word: "읽다", meaning: "đọc" },
      { word: "쓰다", meaning: "viết" },
      { word: "매일", meaning: "mỗi ngày" },
      { word: "보통", meaning: "thường / thông thường" },
      { word: "가끔", meaning: "thỉnh thoảng" },
      { word: "먼저", meaning: "trước tiên" },
      { word: "그리고", meaning: "và rồi" },
      { word: "밤", meaning: "đêm" },
      { word: "낮", meaning: "ban ngày" },
    ],
    sentencePatterns: [
      { sentence: "저는 매일 일곱 시에 ____.", meaning: "Tôi thức dậy lúc 7 giờ mỗi ngày.", answer: "일어납니다", options: ["일어납니다", "잡니다", "봅니다", "씁니다"] },
      { sentence: "아침에 ____.", meaning: "Buổi sáng tôi rửa mặt.", answer: "세수합니다", options: ["세수합니다", "듣습니다", "읽습니다", "쉽니다"] },
      { sentence: "저는 학교에서 ____.", meaning: "Tôi học ở trường.", answer: "공부합니다", options: ["공부합니다", "잡니다", "봅니다", "일어납니다"] },
      { sentence: "밤에 한국어 숙제를 ____.", meaning: "Buổi tối tôi làm bài tập tiếng Hàn.", answer: "합니다", options: ["합니다", "갑니다", "봅니다", "듣습니다"] },
      { sentence: "저는 가끔 음악을 ____.", meaning: "Thỉnh thoảng tôi nghe nhạc.", answer: "듣습니다", options: ["듣습니다", "씁니다", "읽습니다", "잡니다"] },
      { sentence: "보통 열한 시에 ____.", meaning: "Thường tôi ngủ lúc 11 giờ.", answer: "잡니다", options: ["잡니다", "일어납니다", "운동합니다", "씁니다"] },
      { sentence: "먼저 밥을 먹습니다. ____ 공부합니다.", meaning: "Trước tiên ăn cơm. Rồi học.", answer: "그리고", options: ["그리고", "매일", "밤", "낮"] },
      { sentence: "저는 책을 ____.", meaning: "Tôi đọc sách.", answer: "읽습니다", options: ["읽습니다", "듣습니다", "씁니다", "봅니다"] },
    ],
    fillPatterns: [
      { before: "저는 매일 일곱 시에 ", after: ".", meaning: "Tôi thức dậy lúc 7 giờ mỗi ngày.", answer: "일어납니다", hint: "thức dậy" },
      { before: "아침에 ", after: ".", meaning: "Buổi sáng tôi rửa mặt.", answer: "세수합니다", hint: "rửa mặt" },
      { before: "저는 학교에서 ", after: ".", meaning: "Tôi học ở trường.", answer: "공부합니다", hint: "học" },
      { before: "밤에 숙제를 ", after: ".", meaning: "Buổi tối tôi làm bài tập.", answer: "합니다", hint: "làm" },
      { before: "가끔 음악을 ", after: ".", meaning: "Thỉnh thoảng tôi nghe nhạc.", answer: "듣습니다", hint: "nghe" },
      { before: "보통 열한 시에 ", after: ".", meaning: "Thường tôi ngủ lúc 11 giờ.", answer: "잡니다", hint: "ngủ" },
      { before: "먼저 밥을 먹습니다. ", after: " 공부합니다.", meaning: "Trước tiên ăn cơm. Rồi học.", answer: "그리고", hint: "và rồi" },
      { before: "저는 책을 ", after: ".", meaning: "Tôi đọc sách.", answer: "읽습니다", hint: "đọc" },
    ],
  },
  "Sơ cấp 1A|Bài 6": {
    topic: "음식",
    vocabulary: [
      { word: "음식", meaning: "món ăn / thức ăn" },
      { word: "밥", meaning: "cơm" },
      { word: "김치", meaning: "kimchi" },
      { word: "불고기", meaning: "bulgogi" },
      { word: "비빔밥", meaning: "cơm trộn" },
      { word: "라면", meaning: "mì ramen" },
      { word: "물", meaning: "nước" },
      { word: "커피", meaning: "cà phê" },
      { word: "차", meaning: "trà" },
      { word: "주스", meaning: "nước ép" },
      { word: "먹다", meaning: "ăn" },
      { word: "마시다", meaning: "uống" },
      { word: "좋아하다", meaning: "thích" },
      { word: "맛있다", meaning: "ngon" },
      { word: "맛없다", meaning: "không ngon" },
      { word: "맵다", meaning: "cay" },
      { word: "달다", meaning: "ngọt" },
      { word: "식당", meaning: "nhà hàng / quán ăn" },
      { word: "메뉴", meaning: "thực đơn" },
      { word: "주세요", meaning: "xin hãy cho tôi" },
    ],
    sentencePatterns: [
      { sentence: "저는 비빔밥을 ____.", meaning: "Tôi thích cơm trộn.", answer: "좋아합니다", options: ["좋아합니다", "마십니다", "맵습니다", "줍니다"] },
      { sentence: "김치는 조금 ____.", meaning: "Kimchi hơi cay.", answer: "맵습니다", options: ["맵습니다", "답니다", "마십니다", "맛없습니다"] },
      { sentence: "물 한 잔 ____.", meaning: "Cho tôi một cốc nước.", answer: "주세요", options: ["주세요", "먹어요", "좋아해요", "매워요"] },
      { sentence: "저는 커피를 ____.", meaning: "Tôi uống cà phê.", answer: "마십니다", options: ["마십니다", "먹습니다", "좋아합니다", "맵습니다"] },
      { sentence: "불고기는 아주 ____.", meaning: "Bulgogi rất ngon.", answer: "맛있습니다", options: ["맛있습니다", "맛없습니다", "맵습니다", "답니다"] },
      { sentence: "식당에서 라면을 ____.", meaning: "Tôi ăn ramen ở quán ăn.", answer: "먹습니다", options: ["먹습니다", "마십니다", "좋아합니다", "주세요"] },
      { sentence: "이 주스는 ____.", meaning: "Nước ép này ngọt.", answer: "답니다", options: ["답니다", "맵습니다", "맛없습니다", "마십니다"] },
      { sentence: "____를 봅니다.", meaning: "Tôi xem thực đơn.", answer: "메뉴", options: ["메뉴", "물", "밥", "차"] },
    ],
    fillPatterns: [
      { before: "저는 비빔밥을 ", after: ".", meaning: "Tôi thích cơm trộn.", answer: "좋아합니다", hint: "thích" },
      { before: "김치는 조금 ", after: ".", meaning: "Kimchi hơi cay.", answer: "맵습니다", hint: "cay" },
      { before: "물 한 잔 ", after: ".", meaning: "Cho tôi một cốc nước.", answer: "주세요", hint: "xin hãy cho tôi" },
      { before: "저는 커피를 ", after: ".", meaning: "Tôi uống cà phê.", answer: "마십니다", hint: "uống" },
      { before: "불고기는 아주 ", after: ".", meaning: "Bulgogi rất ngon.", answer: "맛있습니다", hint: "ngon" },
      { before: "식당에서 라면을 ", after: ".", meaning: "Tôi ăn ramen ở quán ăn.", answer: "먹습니다", hint: "ăn" },
      { before: "이 주스는 ", after: ".", meaning: "Nước ép này ngọt.", answer: "답니다", hint: "ngọt" },
      { before: "", after: "를 봅니다.", meaning: "Tôi xem thực đơn.", answer: "메뉴", hint: "thực đơn" },
    ],
  },
  "Sơ cấp 1A|Bài 7": {
    topic: "쇼핑",
    vocabulary: [
      { word: "사다", meaning: "mua" },
      { word: "팔다", meaning: "bán" },
      { word: "얼마", meaning: "bao nhiêu tiền" },
      { word: "원", meaning: "won" },
      { word: "돈", meaning: "tiền" },
      { word: "싸다", meaning: "rẻ" },
      { word: "비싸다", meaning: "đắt" },
      { word: "크다", meaning: "to / lớn" },
      { word: "작다", meaning: "nhỏ" },
      { word: "좋다", meaning: "tốt" },
      { word: "나쁘다", meaning: "xấu / không tốt" },
      { word: "옷", meaning: "quần áo" },
      { word: "가방", meaning: "túi / cặp" },
      { word: "구두", meaning: "giày tây" },
      { word: "운동화", meaning: "giày thể thao" },
      { word: "모자", meaning: "mũ" },
      { word: "시장", meaning: "chợ" },
      { word: "가게", meaning: "cửa hàng" },
      { word: "주세요", meaning: "xin hãy cho tôi" },
      { word: "개", meaning: "cái / chiếc" },
    ],
    sentencePatterns: [
      { sentence: "이 가방은 ____입니까?", meaning: "Cái túi này bao nhiêu tiền?", answer: "얼마", options: ["얼마", "원", "개", "시장"] },
      { sentence: "모자 한 개 ____.", meaning: "Cho tôi một cái mũ.", answer: "주세요", options: ["주세요", "팝니다", "삽니다", "비쌉니다"] },
      { sentence: "저는 시장에서 옷을 ____.", meaning: "Tôi mua quần áo ở chợ.", answer: "삽니다", options: ["삽니다", "팝니다", "큽니다", "작습니다"] },
      { sentence: "이 구두는 너무 ____.", meaning: "Đôi giày này quá đắt.", answer: "비쌉니다", options: ["비쌉니다", "쌉니다", "좋습니다", "작습니다"] },
      { sentence: "운동화가 ____.", meaning: "Giày thể thao rẻ.", answer: "쌉니다", options: ["쌉니다", "비쌉니다", "나쁩니다", "큽니다"] },
      { sentence: "이 옷은 조금 ____.", meaning: "Bộ quần áo này hơi nhỏ.", answer: "작습니다", options: ["작습니다", "큽니다", "팝니다", "삽니다"] },
      { sentence: "가게에서 가방을 ____.", meaning: "Ở cửa hàng bán túi.", answer: "팝니다", options: ["팝니다", "삽니다", "주세요", "원"] },
      { sentence: "이 물건은 아주 ____.", meaning: "Món đồ này rất tốt.", answer: "좋습니다", options: ["좋습니다", "나쁩니다", "얼마", "돈"] },
    ],
    fillPatterns: [
      { before: "이 가방은 ", after: "입니까?", meaning: "Cái túi này bao nhiêu tiền?", answer: "얼마", hint: "bao nhiêu tiền" },
      { before: "모자 한 개 ", after: ".", meaning: "Cho tôi một cái mũ.", answer: "주세요", hint: "xin hãy cho tôi" },
      { before: "저는 시장에서 옷을 ", after: ".", meaning: "Tôi mua quần áo ở chợ.", answer: "삽니다", hint: "mua" },
      { before: "이 구두는 너무 ", after: ".", meaning: "Đôi giày này quá đắt.", answer: "비쌉니다", hint: "đắt" },
      { before: "운동화가 ", after: ".", meaning: "Giày thể thao rẻ.", answer: "쌉니다", hint: "rẻ" },
      { before: "이 옷은 조금 ", after: ".", meaning: "Bộ quần áo này hơi nhỏ.", answer: "작습니다", hint: "nhỏ" },
      { before: "가게에서 가방을 ", after: ".", meaning: "Ở cửa hàng bán túi.", answer: "팝니다", hint: "bán" },
      { before: "이 물건은 아주 ", after: ".", meaning: "Món đồ này rất tốt.", answer: "좋습니다", hint: "tốt" },
    ],
  },
};

const extraLessonSeeds: Record<string, LessonSource> = {
  "Sơ cấp 1B|Bài 8": makeSeed("교통", [
    ["버스", "xe buýt"], ["지하철", "tàu điện ngầm"], ["택시", "taxi"], ["기차", "tàu hỏa"], ["비행기", "máy bay"],
    ["정류장", "trạm xe buýt"], ["역", "nhà ga"], ["공항", "sân bay"], ["타다", "lên xe"], ["내리다", "xuống xe"],
    ["갈아타다", "đổi tuyến / chuyển xe"], ["걸어가다", "đi bộ"], ["가깝다", "gần"], ["멀다", "xa"], ["빠르다", "nhanh"],
    ["늦다", "muộn"], ["길", "đường"], ["오른쪽", "bên phải"], ["왼쪽", "bên trái"], ["쭉", "thẳng"],
  ], [
    ["저는 학교에 ____를 타고 가요.", "Tôi đi học bằng xe buýt.", "버스"],
    ["서울역에서 지하철을 ____.", "Tôi lên tàu điện ngầm ở ga Seoul.", "타요"],
    ["집에서 학교까지 조금 ____.", "Từ nhà đến trường hơi xa.", "멀어요"],
    ["오른쪽으로 ____ 가세요.", "Hãy đi thẳng về bên phải.", "쭉"],
    ["공항에 ____ 타고 가요.", "Tôi đi sân bay bằng taxi.", "택시"],
    ["버스 정류장에서 ____.", "Tôi xuống ở trạm xe buýt.", "내려요"],
    ["지하철이 버스보다 ____.", "Tàu điện ngầm nhanh hơn xe buýt.", "빨라요"],
    ["학교는 집에서 ____.", "Trường gần nhà.", "가까워요"],
  ]),
  "Sơ cấp 1B|Bài 9": makeSeed("취미", [
    ["취미", "sở thích"], ["영화", "phim"], ["음악", "âm nhạc"], ["운동", "thể thao"], ["축구", "bóng đá"],
    ["농구", "bóng rổ"], ["수영", "bơi"], ["등산", "leo núi"], ["사진", "ảnh"], ["요리", "nấu ăn"],
    ["그림", "tranh"], ["책", "sách"], ["노래", "bài hát"], ["춤", "điệu nhảy"], ["보다", "xem"],
    ["듣다", "nghe"], ["하다", "làm"], ["좋아하다", "thích"], ["자주", "thường xuyên"], ["가끔", "thỉnh thoảng"],
  ], [
    ["제 ____는 영화 보기예요.", "Sở thích của tôi là xem phim.", "취미"],
    ["저는 음악을 자주 ____.", "Tôi thường nghe nhạc.", "들어요"],
    ["주말에 친구하고 축구를 ____.", "Cuối tuần tôi chơi bóng đá với bạn.", "해요"],
    ["저는 책을 ____ 좋아해요.", "Tôi thích đọc sách.", "읽는 것을"],
    ["동생은 ____를 잘해요.", "Em tôi bơi giỏi.", "수영"],
    ["가끔 산에 가서 ____을 해요.", "Thỉnh thoảng tôi lên núi leo núi.", "등산"],
    ["저는 한국 ____를 좋아해요.", "Tôi thích bài hát Hàn Quốc.", "노래"],
    ["친구는 ____를 잘 만들어요.", "Bạn tôi nấu ăn giỏi.", "요리"],
  ]),
  "Sơ cấp 1B|Bài 10": makeSeed("날씨", [
    ["날씨", "thời tiết"], ["봄", "mùa xuân"], ["여름", "mùa hè"], ["가을", "mùa thu"], ["겨울", "mùa đông"],
    ["덥다", "nóng"], ["춥다", "lạnh"], ["따뜻하다", "ấm áp"], ["시원하다", "mát mẻ"], ["흐리다", "âm u"],
    ["맑다", "trong, quang đãng"], ["비", "mưa"], ["눈", "tuyết"], ["바람", "gió"], ["오다", "rơi / đến"],
    ["많이", "nhiều"], ["조금", "một chút"], ["우산", "ô / dù"], ["입다", "mặc"], ["좋다", "tốt"],
  ], [
    ["오늘 ____가 좋아요.", "Hôm nay thời tiết đẹp.", "날씨"],
    ["여름은 아주 ____.", "Mùa hè rất nóng.", "더워요"],
    ["겨울에는 ____이 와요.", "Mùa đông có tuyết rơi.", "눈"],
    ["비가 와서 ____을 가져가요.", "Vì trời mưa nên mang ô.", "우산"],
    ["봄은 ____.", "Mùa xuân ấm áp.", "따뜻해요"],
    ["가을은 ____.", "Mùa thu mát mẻ.", "시원해요"],
    ["오늘 하늘이 ____.", "Hôm nay trời âm u.", "흐려요"],
    ["바람이 많이 ____.", "Gió thổi nhiều.", "불어요"],
  ]),
  "Sơ cấp 1B|Bài 11": makeSeed("전화", [
    ["전화", "điện thoại"], ["휴대전화", "điện thoại di động"], ["번호", "số"], ["문자", "tin nhắn"], ["통화", "cuộc gọi"],
    ["걸다", "gọi điện"], ["받다", "nhận"], ["끊다", "cúp máy"], ["바꾸다", "chuyển máy"], ["메시지", "tin nhắn"],
    ["여보세요", "a lô"], ["잠깐만", "chờ một chút"], ["지금", "bây giờ"], ["나중에", "sau này"], ["다시", "lại"],
    ["통화 중", "đang bận máy"], ["연락하다", "liên lạc"], ["알다", "biết"], ["모르다", "không biết"], ["남기다", "để lại"],
  ], [
    ["민수 씨에게 전화를 ____.", "Tôi gọi điện cho Minsu.", "걸어요"],
    ["____, 거기 한국어 교실이지요?", "A lô, đó là lớp tiếng Hàn đúng không?", "여보세요"],
    ["지금 선생님은 ____ 중이에요.", "Bây giờ thầy/cô đang bận máy.", "통화"],
    ["전화번호를 ____.", "Tôi biết số điện thoại.", "알아요"],
    ["친구에게 ____를 보내요.", "Tôi gửi tin nhắn cho bạn.", "문자"],
    ["잠깐만 ____ 주세요.", "Xin chờ một chút.", "기다려"],
    ["나중에 다시 ____.", "Lát nữa tôi sẽ liên lạc lại.", "연락해요"],
    ["메시지를 ____.", "Tôi để lại tin nhắn.", "남겨요"],
  ]),
  "Sơ cấp 1B|Bài 12": makeSeed("약속", [
    ["약속", "cuộc hẹn"], ["시간", "thời gian"], ["장소", "địa điểm"], ["만나다", "gặp"], ["기다리다", "chờ"],
    ["늦다", "muộn"], ["빠르다", "sớm / nhanh"], ["괜찮다", "ổn"], ["미안하다", "xin lỗi"], ["약속하다", "hẹn"],
    ["오늘", "hôm nay"], ["내일", "ngày mai"], ["주말", "cuối tuần"], ["카페", "quán cà phê"], ["극장", "rạp chiếu phim"],
    ["앞", "trước"], ["뒤", "sau"], ["옆", "bên cạnh"], ["몇 시", "mấy giờ"], ["어디", "ở đâu"],
  ], [
    ["내일 친구하고 ____이 있어요.", "Ngày mai tôi có hẹn với bạn.", "약속"],
    ["우리 세 시에 ____.", "Chúng ta gặp lúc 3 giờ nhé.", "만나요"],
    ["카페 ____에서 기다릴게요.", "Tôi sẽ chờ trước quán cà phê.", "앞"],
    ["조금 늦어서 ____.", "Tôi xin lỗi vì hơi muộn.", "미안해요"],
    ["시간이 ____?", "Thời gian ổn không?", "괜찮아요"],
    ["주말에 극장에 ____.", "Cuối tuần đi rạp chiếu phim.", "가요"],
    ["몇 시에 ____?", "Gặp lúc mấy giờ?", "만나요"],
    ["장소는 ____예요?", "Địa điểm là ở đâu?", "어디"],
  ]),
  "Sơ cấp 1B|Bài 13": makeSeed("여행", [
    ["여행", "du lịch"], ["방학", "kỳ nghỉ"], ["바다", "biển"], ["산", "núi"], ["호텔", "khách sạn"],
    ["기차표", "vé tàu"], ["비행기표", "vé máy bay"], ["예약", "đặt trước"], ["짐", "hành lý"], ["사진", "ảnh"],
    ["구경하다", "tham quan"], ["출발하다", "xuất phát"], ["도착하다", "đến nơi"], ["묵다", "ở lại"], ["타다", "đi / lên xe"],
    ["즐겁다", "vui vẻ"], ["피곤하다", "mệt"], ["계획", "kế hoạch"], ["이번", "lần này"], ["다음", "lần sau / tiếp theo"],
  ], [
    ["이번 방학에 ____을 가요.", "Kỳ nghỉ này tôi đi du lịch.", "여행"],
    ["호텔을 ____했어요.", "Tôi đã đặt khách sạn.", "예약"],
    ["바다에서 사진을 ____.", "Tôi chụp ảnh ở biển.", "찍어요"],
    ["기차표를 ____.", "Tôi mua vé tàu.", "사요"],
    ["아침에 서울에서 ____.", "Buổi sáng xuất phát từ Seoul.", "출발해요"],
    ["저녁에 부산에 ____.", "Buổi tối đến Busan.", "도착해요"],
    ["여행이 아주 ____.", "Chuyến du lịch rất vui.", "즐거워요"],
    ["산을 ____.", "Tôi tham quan núi.", "구경해요"],
  ]),
  "Sơ cấp 1B|Bài 14": makeSeed("건강", [
    ["건강", "sức khỏe"], ["몸", "cơ thể"], ["머리", "đầu"], ["배", "bụng"], ["목", "cổ họng"],
    ["감기", "cảm cúm"], ["열", "sốt"], ["기침", "ho"], ["약", "thuốc"], ["병원", "bệnh viện"],
    ["아프다", "đau / ốm"], ["쉬다", "nghỉ"], ["먹다", "uống / ăn"], ["자다", "ngủ"], ["운동하다", "tập thể dục"],
    ["괜찮다", "ổn"], ["많이", "nhiều"], ["조금", "một chút"], ["오늘", "hôm nay"], ["어제", "hôm qua"],
  ], [
    ["오늘 머리가 ____.", "Hôm nay tôi đau đầu.", "아파요"],
    ["감기에 걸려서 ____에 가요.", "Bị cảm nên tôi đi bệnh viện.", "병원"],
    ["약을 ____.", "Tôi uống thuốc.", "먹어요"],
    ["열이 많이 ____.", "Tôi sốt cao.", "나요"],
    ["목이 아프고 ____을 해요.", "Đau họng và ho.", "기침"],
    ["오늘은 집에서 ____.", "Hôm nay tôi nghỉ ở nhà.", "쉬어요"],
    ["건강을 위해 ____.", "Tôi tập thể dục vì sức khỏe.", "운동해요"],
    ["지금은 좀 ____.", "Bây giờ đỡ/ổn hơn một chút.", "괜찮아요"],
  ]),
  "Sơ cấp 1B|Bài 15": makeSeed("가족과 집", [
    ["가족", "gia đình"], ["아버지", "bố"], ["어머니", "mẹ"], ["형", "anh trai của nam"], ["오빠", "anh trai của nữ"],
    ["누나", "chị gái của nam"], ["언니", "chị gái của nữ"], ["동생", "em"], ["할아버지", "ông"], ["할머니", "bà"],
    ["집", "nhà"], ["방", "phòng"], ["거실", "phòng khách"], ["부엌", "bếp"], ["화장실", "nhà vệ sinh"],
    ["살다", "sống"], ["크다", "to"], ["작다", "nhỏ"], ["깨끗하다", "sạch sẽ"], ["많다", "nhiều"],
  ], [
    ["우리 ____은 네 명이에요.", "Gia đình tôi có bốn người.", "가족"],
    ["저는 부모님하고 같이 ____.", "Tôi sống cùng bố mẹ.", "살아요"],
    ["우리 집은 조금 ____.", "Nhà tôi hơi nhỏ.", "작아요"],
    ["거실이 아주 ____.", "Phòng khách rất sạch.", "깨끗해요"],
    ["제 ____는 회사원이에요.", "Bố tôi là nhân viên công ty.", "아버지"],
    ["동생은 방에 ____.", "Em ở trong phòng.", "있어요"],
    ["부엌에서 어머니가 요리____.", "Mẹ nấu ăn trong bếp.", "해요"],
    ["우리 집에는 방이 ____.", "Nhà tôi có nhiều phòng.", "많아요"],
  ]),
  "Sơ cấp 2A|Bài 1": makeSeed("만남", [
    ["만남", "cuộc gặp"], ["처음", "lần đầu"], ["소개", "giới thiệu"], ["오랜만", "lâu rồi"], ["잘 지내다", "sống tốt / khỏe"],
    ["반갑다", "vui được gặp"], ["친절하다", "thân thiện"], ["성격", "tính cách"], ["조용하다", "trầm / yên tĩnh"], ["활발하다", "hoạt bát"],
    ["같다", "giống"], ["다르다", "khác"], ["취미", "sở thích"], ["고향", "quê hương"], ["나이", "tuổi"],
    ["직업", "nghề nghiệp"], ["연락처", "thông tin liên lạc"], ["이야기하다", "nói chuyện"], ["알다", "biết"], ["모르다", "không biết"],
  ], [
    ["처음 만나서 ____.", "Rất vui được gặp lần đầu.", "반가워요"],
    ["제 친구는 성격이 ____.", "Bạn tôi tính cách hoạt bát.", "활발해요"],
    ["우리는 취미가 ____.", "Chúng tôi có sở thích giống nhau.", "같아요"],
    ["고향이 어디인지 ____ 주세요.", "Xin hãy cho tôi biết quê ở đâu.", "알려"],
    ["오랜만이에요. 잘 ____?", "Lâu rồi không gặp. Bạn khỏe không?", "지냈어요"],
    ["이 사람을 친구에게 ____.", "Tôi giới thiệu người này với bạn.", "소개해요"],
    ["연락처를 잘 ____.", "Tôi không biết rõ thông tin liên lạc.", "몰라요"],
    ["친구하고 많이 ____.", "Tôi nói chuyện nhiều với bạn.", "이야기해요"],
  ]),
  "Sơ cấp 2A|Bài 2": makeSeed("약속", [
    ["약속", "cuộc hẹn"], ["정하다", "quyết định"], ["바꾸다", "đổi"], ["취소하다", "hủy"], ["늦다", "muộn"],
    ["연락하다", "liên lạc"], ["기다리다", "chờ"], ["가능하다", "có thể"], ["불가능하다", "không thể"], ["시간이 나다", "có thời gian"],
    ["회의", "cuộc họp"], ["모임", "buổi gặp mặt"], ["장소", "địa điểm"], ["카페", "quán cà phê"], ["극장", "rạp chiếu phim"],
    ["앞", "trước"], ["후", "sau"], ["먼저", "trước"], ["나중에", "sau"], ["괜찮다", "ổn"],
  ], [
    ["내일 약속 시간을 ____.", "Ngày mai quyết định thời gian hẹn.", "정해요"],
    ["일이 있어서 약속을 ____.", "Vì có việc nên hủy cuộc hẹn.", "취소해요"],
    ["늦으면 꼭 ____.", "Nếu muộn thì nhất định liên lạc.", "연락해요"],
    ["회의 후에 카페에서 ____.", "Sau cuộc họp gặp ở quán cà phê.", "만나요"],
    ["오늘은 시간이 ____.", "Hôm nay tôi có thời gian.", "나요"],
    ["장소를 극장 앞으로 ____.", "Đổi địa điểm sang trước rạp chiếu phim.", "바꿔요"],
    ["친구를 삼십 분 동안 ____.", "Tôi chờ bạn 30 phút.", "기다려요"],
    ["그 시간은 저도 ____.", "Thời gian đó tôi cũng ổn.", "괜찮아요"],
  ]),
  "Sơ cấp 2A|Bài 3": makeSeed("물건 사기", [
    ["물건", "đồ vật"], ["가격", "giá"], ["할인", "giảm giá"], ["계산하다", "tính tiền"], ["교환하다", "đổi hàng"],
    ["환불하다", "hoàn tiền"], ["영수증", "hóa đơn"], ["현금", "tiền mặt"], ["카드", "thẻ"], ["비싸다", "đắt"],
    ["싸다", "rẻ"], ["고르다", "chọn"], ["필요하다", "cần"], ["사이즈", "kích cỡ"], ["색깔", "màu sắc"],
    ["입어 보다", "mặc thử"], ["신어 보다", "đi thử giày"], ["찾다", "tìm"], ["손님", "khách"], ["점원", "nhân viên bán hàng"],
  ], [
    ["이 옷은 가격이 ____.", "Bộ quần áo này giá đắt.", "비싸요"],
    ["카드로 ____.", "Tôi thanh toán bằng thẻ.", "계산해요"],
    ["영수증을 꼭 ____.", "Nhất định nhận hóa đơn.", "받아요"],
    ["다른 색깔로 ____ 주세요.", "Xin đổi sang màu khác.", "교환해"],
    ["이 신발을 ____ 봐도 돼요?", "Tôi đi thử đôi giày này được không?", "신어"],
    ["저는 큰 사이즈를 ____.", "Tôi tìm kích cỡ lớn.", "찾아요"],
    ["오늘 할인해서 ____.", "Hôm nay giảm giá nên rẻ.", "싸요"],
    ["필요한 물건을 먼저 ____.", "Trước tiên chọn đồ cần thiết.", "골라요"],
  ]),
  "Sơ cấp 2A|Bài 4": makeSeed("병원", [
    ["병원", "bệnh viện"], ["약국", "hiệu thuốc"], ["의사", "bác sĩ"], ["간호사", "y tá"], ["환자", "bệnh nhân"],
    ["증상", "triệu chứng"], ["머리", "đầu"], ["배", "bụng"], ["목", "cổ họng"], ["열", "sốt"],
    ["기침", "ho"], ["감기", "cảm cúm"], ["약", "thuốc"], ["주사", "tiêm"], ["쉬다", "nghỉ"],
    ["아프다", "đau"], ["낫다", "khỏi bệnh"], ["예약하다", "đặt lịch"], ["진찰하다", "khám bệnh"], ["조심하다", "cẩn thận"],
  ], [
    ["배가 아파서 ____에 갔어요.", "Vì đau bụng nên tôi đã đi bệnh viện.", "병원"],
    ["의사 선생님이 저를 ____.", "Bác sĩ khám cho tôi.", "진찰해요"],
    ["약국에서 ____을 샀어요.", "Tôi mua thuốc ở hiệu thuốc.", "약"],
    ["감기에 걸려서 ____이 나요.", "Bị cảm nên bị sốt.", "열"],
    ["목이 아파서 말을 많이 하지 ____.", "Đau họng nên đừng nói nhiều.", "마세요"],
    ["오늘은 집에서 ____ 해요.", "Hôm nay phải nghỉ ở nhà.", "쉬어야"],
    ["병원에 가기 전에 ____.", "Trước khi đến bệnh viện thì đặt lịch.", "예약해요"],
    ["건강을 조심____.", "Hãy cẩn thận sức khỏe.", "하세요"],
  ]),
  "Sơ cấp 2A|Bài 5": makeSeed("편지와 소포", [
    ["우체국", "bưu điện"], ["편지", "thư"], ["소포", "bưu kiện"], ["엽서", "bưu thiếp"], ["주소", "địa chỉ"],
    ["우표", "tem"], ["보내다", "gửi"], ["받다", "nhận"], ["쓰다", "viết"], ["붙이다", "dán"],
    ["무게", "cân nặng"], ["요금", "phí"], ["빠르다", "nhanh"], ["느리다", "chậm"], ["국제", "quốc tế"],
    ["국내", "trong nước"], ["선물", "quà"], ["도착하다", "đến nơi"], ["확인하다", "xác nhận"], ["직원", "nhân viên"],
  ], [
    ["우체국에서 소포를 ____.", "Tôi gửi bưu kiện ở bưu điện.", "보내요"],
    ["편지에 주소를 ____.", "Tôi viết địa chỉ lên thư.", "써요"],
    ["봉투에 우표를 ____.", "Tôi dán tem lên phong bì.", "붙여요"],
    ["이 소포는 무게가 조금 ____.", "Bưu kiện này hơi nặng.", "무거워요"],
    ["국제 우편 요금을 ____.", "Tôi xác nhận phí thư quốc tế.", "확인해요"],
    ["친구에게 선물을 ____.", "Tôi gửi quà cho bạn.", "보내요"],
    ["엽서를 ____.", "Tôi nhận bưu thiếp.", "받아요"],
    ["소포가 내일 ____.", "Bưu kiện sẽ đến nơi ngày mai.", "도착해요"],
  ]),
  "Sơ cấp 2A|Bài 6": makeSeed("교통", [
    ["교통", "giao thông"], ["버스", "xe buýt"], ["지하철", "tàu điện ngầm"], ["택시", "taxi"], ["기차", "tàu hỏa"],
    ["정류장", "trạm xe"], ["역", "ga"], ["노선", "tuyến"], ["환승", "chuyển tuyến"], ["교통카드", "thẻ giao thông"],
    ["막히다", "tắc"], ["빠르다", "nhanh"], ["편하다", "tiện"], ["불편하다", "bất tiện"], ["걸리다", "mất thời gian"],
    ["출발하다", "xuất phát"], ["도착하다", "đến nơi"], ["타다", "lên xe"], ["내리다", "xuống xe"], ["갈아타다", "đổi xe"],
  ], [
    ["출근 시간에는 길이 많이 ____.", "Giờ đi làm đường rất tắc.", "막혀요"],
    ["지하철이 버스보다 ____.", "Tàu điện ngầm nhanh hơn xe buýt.", "빨라요"],
    ["교통카드로 버스를 ____.", "Tôi đi xe buýt bằng thẻ giao thông.", "타요"],
    ["서울역에서 지하철로 ____.", "Tôi chuyển sang tàu điện ngầm ở ga Seoul.", "갈아타요"],
    ["학교까지 삼십 분 ____.", "Đến trường mất 30 phút.", "걸려요"],
    ["택시는 편하지만 조금 ____.", "Taxi tiện nhưng hơi đắt.", "비싸요"],
    ["다음 정류장에서 ____.", "Tôi xuống ở trạm tiếp theo.", "내려요"],
    ["기차가 여덟 시에 ____.", "Tàu xuất phát lúc 8 giờ.", "출발해요"],
  ]),
  "Sơ cấp 2A|Bài 7": makeSeed("전화", [
    ["전화", "điện thoại"], ["통화", "cuộc gọi"], ["문자", "tin nhắn"], ["연락", "liên lạc"], ["번호", "số"],
    ["받다", "nhận"], ["걸다", "gọi"], ["끊다", "cúp"], ["바쁘다", "bận"], ["부재중", "vắng mặt"],
    ["메시지", "tin nhắn"], ["남기다", "để lại"], ["다시", "lại"], ["나중에", "sau"], ["잠시", "một lát"],
    ["기다리다", "chờ"], ["잘못", "nhầm"], ["확인하다", "xác nhận"], ["알리다", "thông báo"], ["예약", "đặt lịch"],
  ], [
    ["친구에게 전화를 ____.", "Tôi gọi điện cho bạn.", "걸어요"],
    ["지금 통화할 수 없어서 메시지를 ____.", "Bây giờ không thể gọi nên để lại tin nhắn.", "남겨요"],
    ["번호를 다시 ____.", "Tôi xác nhận lại số.", "확인해요"],
    ["잠시만 ____ 주세요.", "Xin hãy chờ một lát.", "기다려"],
    ["나중에 다시 ____.", "Lát nữa tôi gọi lại.", "전화해요"],
    ["전화가 잘못 ____.", "Cuộc gọi bị nhầm số.", "왔어요"],
    ["예약 시간을 문자로 ____.", "Tôi thông báo giờ đặt lịch bằng tin nhắn.", "알려요"],
    ["수업 중에는 전화를 ____ 마세요.", "Trong giờ học đừng nhận điện thoại.", "받지"],
  ]),
  "Sơ cấp 2B|Bài 8": makeSeed("집안일", [
    ["집안일", "việc nhà"], ["청소하다", "dọn dẹp"], ["빨래하다", "giặt quần áo"], ["설거지하다", "rửa bát"], ["요리하다", "nấu ăn"],
    ["쓰레기", "rác"], ["버리다", "vứt"], ["닦다", "lau"], ["쓸다", "quét"], ["정리하다", "sắp xếp"],
    ["도와주다", "giúp đỡ"], ["힘들다", "vất vả"], ["깨끗하다", "sạch"], ["더럽다", "bẩn"], ["방", "phòng"],
    ["거실", "phòng khách"], ["부엌", "bếp"], ["화장실", "nhà vệ sinh"], ["매일", "mỗi ngày"], ["가끔", "thỉnh thoảng"],
  ], [
    ["주말마다 방을 ____.", "Cuối tuần nào tôi cũng dọn phòng.", "청소해요"],
    ["식사 후에 설거지를 ____.", "Sau bữa ăn tôi rửa bát.", "해요"],
    ["쓰레기를 밖에 ____.", "Tôi vứt rác ra ngoài.", "버려요"],
    ["동생이 집안일을 ____.", "Em giúp việc nhà.", "도와줘요"],
    ["부엌이 아주 ____.", "Bếp rất sạch.", "깨끗해요"],
    ["오늘은 빨래를 ____ 해요.", "Hôm nay phải giặt quần áo.", "해야"],
    ["책상을 잘 ____.", "Tôi sắp xếp bàn học gọn.", "정리해요"],
    ["청소가 조금 ____.", "Việc dọn dẹp hơi vất vả.", "힘들어요"],
  ]),
  "Sơ cấp 2B|Bài 9": makeSeed("기분과 성격", [
    ["기분", "tâm trạng"], ["성격", "tính cách"], ["기쁘다", "vui"], ["슬프다", "buồn"], ["화가 나다", "tức giận"],
    ["걱정하다", "lo lắng"], ["긴장하다", "căng thẳng"], ["편하다", "thoải mái"], ["불편하다", "bất tiện / không thoải mái"], ["친절하다", "thân thiện"],
    ["부지런하다", "chăm chỉ"], ["게으르다", "lười"], ["조용하다", "trầm / yên tĩnh"], ["활발하다", "hoạt bát"], ["웃다", "cười"],
    ["울다", "khóc"], ["행복하다", "hạnh phúc"], ["외롭다", "cô đơn"], ["피곤하다", "mệt"], ["놀라다", "ngạc nhiên"],
  ], [
    ["시험 전이라서 조금 ____.", "Vì trước kỳ thi nên hơi căng thẳng.", "긴장돼요"],
    ["친구를 만나서 기분이 ____.", "Gặp bạn nên tâm trạng vui.", "좋아요"],
    ["그 사람은 항상 ____.", "Người đó luôn thân thiện.", "친절해요"],
    ["민수 씨는 일을 잘하고 ____.", "Minsu làm việc tốt và chăm chỉ.", "부지런해요"],
    ["동생은 사람들 앞에서 ____.", "Em tôi trầm trước mọi người.", "조용해요"],
    ["좋은 소식을 듣고 ____.", "Nghe tin tốt nên hạnh phúc.", "행복해요"],
    ["어제 늦게 자서 ____.", "Hôm qua ngủ muộn nên mệt.", "피곤해요"],
    ["갑자기 큰 소리를 듣고 ____.", "Nghe tiếng lớn đột ngột nên ngạc nhiên.", "놀랐어요"],
  ]),
  "Sơ cấp 2B|Bài 10": {
    topic: "외모",
    vocabulary: [
      { word: "외모", meaning: "ngoại hình" },
      { word: "묘사", meaning: "mô tả" },
      { word: "머리", meaning: "đầu / tóc" },
      { word: "긴 머리", meaning: "tóc dài" },
      { word: "짧은 머리", meaning: "tóc ngắn" },
      { word: "단발머리", meaning: "tóc tém / tóc ngang vai" },
      { word: "파마머리", meaning: "tóc uốn" },
      { word: "생머리", meaning: "tóc thẳng" },
      { word: "곱슬머리", meaning: "tóc xoăn" },
      { word: "체격", meaning: "dáng người / thể hình" },
      { word: "날씬하다", meaning: "thon thả" },
      { word: "보통이다", meaning: "bình thường" },
      { word: "통통하다", meaning: "đầy đặn / hơi mũm mĩm" },
      { word: "모습", meaning: "dáng vẻ / hình ảnh bên ngoài" },
      { word: "잘생겼다", meaning: "đẹp trai" },
      { word: "멋있다", meaning: "đẹp / có phong cách" },
      { word: "예쁘다", meaning: "xinh đẹp" },
      { word: "귀엽다", meaning: "dễ thương" },
      { word: "닮다", meaning: "giống / giống với" },
      { word: "사랑스럽다", meaning: "đáng yêu" },
      { word: "색깔", meaning: "màu sắc" },
      { word: "빨간색", meaning: "màu đỏ" },
      { word: "노란색", meaning: "màu vàng" },
      { word: "파란색", meaning: "màu xanh nước biển" },
      { word: "하얀색", meaning: "màu trắng" },
      { word: "까만색", meaning: "màu đen" },
      { word: "녹색", meaning: "màu xanh lá cây" },
      { word: "갈색", meaning: "màu nâu" },
      { word: "분홍색", meaning: "màu hồng" },
      { word: "회색", meaning: "màu xám" },
      { word: "보라색", meaning: "màu tím" },
      { word: "주황색", meaning: "màu cam" },
      { word: "베이지색", meaning: "màu be" },
      { word: "입다", meaning: "mặc quần áo" },
      { word: "벗다", meaning: "cởi ra" },
      { word: "신다", meaning: "mang giày / đi giày" },
      { word: "쓰다", meaning: "đội / đeo / dùng" },
      { word: "끼다", meaning: "đeo nhẫn / đeo găng tay" },
      { word: "차다", meaning: "đeo đồng hồ" },
      { word: "가죽", meaning: "da / chất liệu da" },
      { word: "선풍기", meaning: "quạt máy" },
      { word: "지퍼", meaning: "khóa kéo" },
      { word: "다이어트", meaning: "ăn kiêng / giảm cân" },
      { word: "열쇠고리", meaning: "móc khóa" },
      { word: "활발하다", meaning: "hoạt bát / năng động" },
      { word: "메다", meaning: "đeo / khoác túi lên vai" },
      { word: "운동복", meaning: "quần áo thể thao" },
      { word: "부지런하다", meaning: "chăm chỉ / cần cù" },
      { word: "주머니", meaning: "túi áo / túi quần" },
    ],
    sentenceChoiceQuestions: [
      { sentence: "제 친구는 키가 크고 성격이 아주 ____.", meaning: "Bạn tôi cao và tính cách rất hoạt bát.", answer: "활발해요", options: ["활발해요", "하얀색이에요", "차요", "짧은 머리예요"] },
      { sentence: "저는 오늘 학교에 갈 때 운동화를 ____.", meaning: "Hôm nay khi đi đến trường, tôi mang giày thể thao.", answer: "신었어요", options: ["입었어요", "신었어요", "썼어요", "메었어요"] },
      { sentence: "날씨가 추워서 두꺼운 옷을 ____ 해요.", meaning: "Vì thời tiết lạnh nên phải mặc áo dày.", answer: "입어야", options: ["입어야", "벗어야", "닮아야", "차야"] },
      { sentence: "저 사람은 우리 오빠와 정말 ____.", meaning: "Người kia thật sự giống anh trai tôi.", answer: "닮았어요", options: ["닮았어요", "끼었어요", "보통이에요", "메었어요"] },
      { sentence: "이 가방은 ____이라서 고급스러워 보여요.", meaning: "Cái túi này làm bằng da nên trông sang trọng.", answer: "가죽", options: ["가죽", "선풍기", "주머니", "색깔"] },
      { sentence: "민수 씨는 요즘 ____를 해서 더 날씬해졌어요.", meaning: "Minsu dạo này ăn kiêng nên đã trở nên thon thả hơn.", answer: "다이어트", options: ["다이어트", "묘사", "지퍼", "열쇠고리"] },
      { sentence: "저는 여름에 ____ 옷을 자주 입어요.", meaning: "Vào mùa hè tôi thường mặc quần áo màu trắng.", answer: "하얀색", options: ["하얀색", "까만색", "갈색", "보라색"] },
      { sentence: "가방 ____가 고장 나서 열 수 없어요.", meaning: "Khóa kéo của túi bị hỏng nên không thể mở được.", answer: "지퍼", options: ["지퍼", "체격", "모습", "색깔"] },
      { sentence: "그 학생은 항상 일찍 일어나고 정말 ____.", meaning: "Học sinh đó luôn dậy sớm và thật sự chăm chỉ.", answer: "부지런해요", options: ["부지런해요", "통통해요", "파란색이에요", "예뻐요"] },
      { sentence: "동생은 ____라서 사람들이 자주 귀엽다고 해요.", meaning: "Em tôi có tóc xoăn nên mọi người thường nói là dễ thương.", answer: "곱슬머리", options: ["곱슬머리", "운동복", "열쇠고리", "선풍기"] },
      { sentence: "저는 시계를 오른손에 ____.", meaning: "Tôi đeo đồng hồ ở tay phải.", answer: "차요", options: ["차요", "입어요", "신어요", "메요"] },
      { sentence: "이 사람의 ____를 한국어로 묘사해 보세요.", meaning: "Hãy thử mô tả ngoại hình của người này bằng tiếng Hàn.", answer: "외모", options: ["외모", "주머니", "녹색", "선풍기"] },
    ],
    fillBlankQuestions: [
      { sentenceBefore: "저는 머리가 길어서 ", sentenceAfter: "라고 할 수 있어요.", meaning: "Tôi có tóc dài nên có thể nói là tóc dài.", answer: "긴머리", acceptedAnswers: ["긴머리", "긴 머리"], hint: "tóc dài" },
      { sentenceBefore: "친구는 운동을 많이 해서 몸이 아주 ", sentenceAfter: ".", meaning: "Bạn tôi vận động nhiều nên dáng người rất thon thả.", answer: "날씬해요", acceptedAnswers: ["날씬해요"], hint: "thon thả" },
      { sentenceBefore: "이 모자는 너무 예뻐서 매일 ", sentenceAfter: ".", meaning: "Cái mũ này rất đẹp nên ngày nào tôi cũng đội.", answer: "씁니다", acceptedAnswers: ["씁니다"], hint: "đội / dùng" },
      { sentenceBefore: "수업이 끝나면 편한 ", sentenceAfter: "을/를 입고 운동해요.", meaning: "Sau khi tan học, tôi mặc đồ thể thao thoải mái và tập thể dục.", answer: "운동복", acceptedAnswers: ["운동복"], hint: "quần áo thể thao" },
      { sentenceBefore: "가방 안에 ", sentenceAfter: "가 있어서 열쇠를 쉽게 찾을 수 있어요.", meaning: "Trong túi có móc khóa nên có thể dễ dàng tìm chìa khóa.", answer: "열쇠고리", acceptedAnswers: ["열쇠고리"], hint: "móc khóa" },
      { sentenceBefore: "그 사람은 웃는 모습이 정말 ", sentenceAfter: ".", meaning: "Dáng vẻ khi cười của người đó thật sự đáng yêu.", answer: "사랑스러워요", acceptedAnswers: ["사랑스러워요"], hint: "đáng yêu" },
      { sentenceBefore: "저는 검은색보다 ", sentenceAfter: "을/를 더 좋아해요.", meaning: "Tôi thích màu xanh nước biển hơn màu đen.", answer: "파란색", acceptedAnswers: ["파란색"], hint: "màu xanh nước biển" },
      { sentenceBefore: "오늘은 날씨가 더워서 긴 옷을 ", sentenceAfter: ".", meaning: "Hôm nay thời tiết nóng nên tôi cởi áo dài tay ra.", answer: "벗어요", acceptedAnswers: ["벗어요"], hint: "cởi ra" },
      { sentenceBefore: "그 학생은 발표도 잘하고 성격도 ", sentenceAfter: ".", meaning: "Học sinh đó thuyết trình tốt và tính cách cũng hoạt bát.", answer: "활발해요", acceptedAnswers: ["활발해요"], hint: "hoạt bát" },
      { sentenceBefore: "바지 ", sentenceAfter: "에 휴대폰을 넣었어요.", meaning: "Tôi đã bỏ điện thoại vào túi quần.", answer: "주머니", acceptedAnswers: ["주머니"], hint: "túi áo / túi quần" },
      { sentenceBefore: "제 언니는 ", sentenceAfter: "라서 머리가 자연스럽게 곧아요.", meaning: "Chị tôi có tóc thẳng nên tóc tự nhiên rất thẳng.", answer: "생머리", acceptedAnswers: ["생머리"], hint: "tóc thẳng" },
      { sentenceBefore: "저는 손가락에 반지를 ", sentenceAfter: ".", meaning: "Tôi đeo nhẫn ở ngón tay.", answer: "껴요", acceptedAnswers: ["껴요"], hint: "đeo / mang nhẫn" },
    ],
  },
  "Sơ cấp 2B|Bài 11": makeSeed("여행과 숙박", [
    ["여행지", "điểm du lịch"], ["숙소", "chỗ ở"], ["호텔", "khách sạn"], ["민박", "nhà trọ"], ["예약하다", "đặt trước"],
    ["취소하다", "hủy"], ["확인하다", "xác nhận"], ["방", "phòng"], ["하룻밤", "một đêm"], ["요금", "phí"],
    ["경치", "phong cảnh"], ["유명하다", "nổi tiếng"], ["조용하다", "yên tĩnh"], ["복잡하다", "phức tạp / đông đúc"], ["편하다", "tiện"],
    ["불편하다", "bất tiện"], ["구경하다", "tham quan"], ["쉬다", "nghỉ"], ["사진을 찍다", "chụp ảnh"], ["추억", "kỷ niệm"],
  ], [
    ["제주도는 경치가 ____.", "Jeju phong cảnh đẹp.", "좋아요"],
    ["호텔 방을 미리 ____.", "Tôi đặt phòng khách sạn trước.", "예약해요"],
    ["숙소 요금을 ____.", "Tôi xác nhận phí chỗ ở.", "확인해요"],
    ["바다에서 사진을 ____.", "Tôi chụp ảnh ở biển.", "찍어요"],
    ["이 여행지는 아주 ____.", "Điểm du lịch này rất nổi tiếng.", "유명해요"],
    ["숙소가 조용해서 ____.", "Chỗ ở yên tĩnh nên tiện/thoải mái.", "편해요"],
    ["주말에는 사람이 많아서 ____.", "Cuối tuần đông người nên phức tạp.", "복잡해요"],
    ["여행하면서 좋은 ____을 만들었어요.", "Khi đi du lịch tôi đã tạo kỷ niệm đẹp.", "추억"],
  ]),
  "Sơ cấp 2B|Bài 12": makeSeed("공공예절", [
    ["예절", "lễ nghi"], ["공공장소", "nơi công cộng"], ["규칙", "quy tắc"], ["조용히", "một cách yên lặng"], ["떠들다", "ồn ào"],
    ["줄을 서다", "xếp hàng"], ["양보하다", "nhường"], ["금연", "cấm hút thuốc"], ["촬영 금지", "cấm chụp ảnh"], ["휴대전화", "điện thoại di động"],
    ["끄다", "tắt"], ["켜다", "bật"], ["버리다", "vứt"], ["지키다", "giữ / tuân thủ"], ["주의하다", "chú ý"],
    ["위험하다", "nguy hiểm"], ["가능하다", "có thể"], ["금지하다", "cấm"], ["안내문", "bảng hướng dẫn"], ["실례하다", "thất lễ"],
  ], [
    ["도서관에서는 조용히 ____ 해요.", "Ở thư viện phải nói chuyện nhỏ/yên lặng.", "말해야"],
    ["공공장소에서 규칙을 ____.", "Ở nơi công cộng tuân thủ quy tắc.", "지켜요"],
    ["버스에서 어른께 자리를 ____.", "Trên xe buýt nhường chỗ cho người lớn tuổi.", "양보해요"],
    ["여기에 쓰레기를 ____ 마세요.", "Đừng vứt rác ở đây.", "버리지"],
    ["극장에서는 휴대전화를 ____.", "Ở rạp chiếu phim hãy tắt điện thoại.", "꺼요"],
    ["사람들이 줄을 ____.", "Mọi người xếp hàng.", "서요"],
    ["이곳은 촬영 ____입니다.", "Nơi này cấm chụp ảnh.", "금지"],
    ["안내문을 잘 ____.", "Hãy đọc kỹ bảng hướng dẫn.", "읽어요"],
  ]),
  "Sơ cấp 2B|Bài 13": makeSeed("도시와 생활", [
    ["도시", "thành phố"], ["시골", "nông thôn"], ["생활", "cuộc sống"], ["인구", "dân số"], ["교통", "giao thông"],
    ["건물", "tòa nhà"], ["공원", "công viên"], ["편의점", "cửa hàng tiện lợi"], ["마트", "siêu thị"], ["문화생활", "đời sống văn hóa"],
    ["복잡하다", "phức tạp / đông đúc"], ["조용하다", "yên tĩnh"], ["깨끗하다", "sạch"], ["편리하다", "tiện lợi"], ["불편하다", "bất tiện"],
    ["살다", "sống"], ["이사하다", "chuyển nhà"], ["가깝다", "gần"], ["멀다", "xa"], ["발전하다", "phát triển"],
  ], [
    ["서울은 인구가 ____.", "Seoul có dân số đông.", "많아요"],
    ["도시 생활은 편리하지만 ____.", "Cuộc sống thành phố tiện nhưng đông đúc.", "복잡해요"],
    ["우리 집 근처에 공원이 ____.", "Gần nhà tôi có công viên.", "있어요"],
    ["시골은 조용하고 공기가 ____.", "Nông thôn yên tĩnh và không khí sạch.", "깨끗해요"],
    ["저는 다음 달에 이사____.", "Tháng sau tôi chuyển nhà.", "해요"],
    ["편의점이 가까워서 ____.", "Cửa hàng tiện lợi gần nên tiện.", "편리해요"],
    ["그 도시는 많이 ____.", "Thành phố đó phát triển nhiều.", "발전했어요"],
    ["학교는 집에서 조금 ____.", "Trường hơi xa nhà.", "멀어요"],
  ]),
  "Sơ cấp 2B|Bài 14": makeSeed("계획과 희망", [
    ["계획", "kế hoạch"], ["희망", "hy vọng"], ["꿈", "ước mơ"], ["목표", "mục tiêu"], ["준비하다", "chuẩn bị"],
    ["노력하다", "nỗ lực"], ["성공하다", "thành công"], ["실패하다", "thất bại"], ["취직하다", "xin được việc"], ["졸업하다", "tốt nghiệp"],
    ["유학하다", "du học"], ["배우다", "học"], ["연습하다", "luyện tập"], ["모으다", "gom / tiết kiệm"], ["돈", "tiền"],
    ["미래", "tương lai"], ["이번", "lần này"], ["다음", "tiếp theo"], ["꼭", "nhất định"], ["열심히", "chăm chỉ"],
  ], [
    ["저는 한국어를 열심히 ____.", "Tôi học tiếng Hàn chăm chỉ.", "배워요"],
    ["미래 계획을 ____.", "Tôi lập kế hoạch tương lai.", "세워요"],
    ["제 꿈은 한국에서 ____ 거예요.", "Ước mơ của tôi là du học ở Hàn Quốc.", "유학하는"],
    ["목표를 위해 매일 ____.", "Vì mục tiêu, mỗi ngày tôi nỗ lực.", "노력해요"],
    ["졸업 후에 취직____ 싶어요.", "Sau tốt nghiệp tôi muốn xin việc.", "하고"],
    ["여행하려고 돈을 ____.", "Tôi tiết kiệm tiền để đi du lịch.", "모아요"],
    ["시험을 잘 보려고 ____.", "Tôi chuẩn bị để thi tốt.", "준비해요"],
    ["이번에는 꼭 ____ 싶어요.", "Lần này nhất định muốn thành công.", "성공하고"],
  ]),
  "Sơ cấp 2B|Bài 15": makeSeed("한국 생활", [
    ["한국 생활", "cuộc sống ở Hàn Quốc"], ["문화", "văn hóa"], ["음식", "đồ ăn"], ["교통", "giao thông"], ["집", "nhà"],
    ["학교", "trường học"], ["회사", "công ty"], ["생활비", "chi phí sinh hoạt"], ["친구", "bạn bè"], ["이웃", "hàng xóm"],
    ["익숙하다", "quen"], ["낯설다", "lạ lẫm"], ["어렵다", "khó"], ["쉽다", "dễ"], ["재미있다", "thú vị"],
    ["힘들다", "vất vả"], ["도움", "sự giúp đỡ"], ["경험", "trải nghiệm"], ["적응하다", "thích nghi"], ["배우다", "học"],
  ], [
    ["처음에는 한국 생활이 ____.", "Ban đầu cuộc sống ở Hàn Quốc lạ lẫm.", "낯설었어요"],
    ["지금은 많이 ____.", "Bây giờ tôi đã quen nhiều.", "익숙해졌어요"],
    ["한국 음식을 ____.", "Tôi học món ăn Hàn Quốc.", "배워요"],
    ["친구에게 도움을 ____.", "Tôi nhận sự giúp đỡ từ bạn.", "받았어요"],
    ["새로운 문화를 ____.", "Tôi trải nghiệm văn hóa mới.", "경험해요"],
    ["생활비가 조금 ____.", "Chi phí sinh hoạt hơi đắt.", "비싸요"],
    ["학교생활이 힘들지만 ____.", "Đời sống trường học vất vả nhưng thú vị.", "재미있어요"],
    ["한국 생활에 잘 ____ 싶어요.", "Tôi muốn thích nghi tốt với cuộc sống Hàn Quốc.", "적응하고"],
  ]),
};

const QUESTION_COUNT_PER_TYPE = 30;

const rotateOptions = (options: string[], shift: number) => {
  if (options.length === 0) return options;
  const offset = shift % options.length;
  return [...options.slice(offset), ...options.slice(0, offset)];
};

function makeSeed(
  topic: string,
  vocabPairs: string[][],
  sentenceRows: string[][]
): LessonSeed {
  const vocabulary = vocabPairs.map(([word, meaning]) => ({ word, meaning }));
  const sentencePatterns = sentenceRows.map(([sentence, meaning, answer], index) => {
    const distractors = vocabulary
      .map((item) => item.word.replace(/\s+/g, ""))
      .filter((word) => word !== answer.replace(/\s+/g, ""))
      .slice(index, index + 3);

    while (distractors.length < 3) {
      const fallback = vocabulary[(index + distractors.length + 4) % vocabulary.length]?.word;
      if (fallback && fallback !== answer) distractors.push(fallback);
      else distractors.push("다른말");
    }

    const options = [...distractors.slice(0, 3)];
    options.splice(index % 4, 0, answer);

    return {
      sentence,
      meaning,
      answer,
      options: options.slice(0, 4),
    };
  });

  const fillPatterns = sentenceRows.slice(0, 8).map(([sentence, meaning, answer]) => {
    const [before, after = "."] = sentence.split("____");
    const hint = vocabulary.find((item) => answer.includes(item.word) || item.word.includes(answer))?.meaning ?? meaning;

    return {
      before,
      after,
      meaning,
      answer,
      hint,
    };
  });

  return { topic, vocabulary, sentencePatterns, fillPatterns };
}

function makeWorkbookSeed(topic: string, vocabPairs: string[][]): LessonSeed {
  const normalizedPairs = vocabPairs.slice(0, 30);
  const vocabulary = normalizedPairs.map(([word, meaning]) => ({ word, meaning }));
  const reservedFromMeaning = new Set(vocabulary.map((item) => normalizeKey(item.word)));
  const sentencePatterns = buildWorkbookSentencePatterns(topic, reservedFromMeaning);
  const reservedFromSentence = new Set([
    ...Array.from(reservedFromMeaning),
    ...sentencePatterns.map((question) => normalizeKey(question.answer)),
  ]);
  const fillPatterns = buildWorkbookFillPatterns(topic, reservedFromSentence);

  return { topic, vocabulary, sentencePatterns, fillPatterns };
}

type PracticeBankItem = {
  answer: string;
  prompt: string;
  meaning: string;
  hint: string;
};

const lessonSentenceFocus: Record<string, PracticeBankItem[]> = {
  "한글": makeBank("한글", [
    ["받침 읽기", "Âm cuối trong tiếng Hàn"],
    ["초성 위치", "Vị trí phụ âm đầu"],
    ["중성 위치", "Vị trí nguyên âm giữa"],
    ["종성 위치", "Vị trí phụ âm cuối"],
    ["모음 결합", "Ghép nguyên âm"],
    ["자음 결합", "Ghép phụ âm"],
    ["왼쪽에서 오른쪽", "Viết từ trái sang phải"],
    ["위에서 아래", "Viết từ trên xuống dưới"],
    ["한 음절", "Một âm tiết"],
    ["두 음절", "Hai âm tiết"],
  ]),
  "소개": makeBank("소개", [
    ["명사입니다", "Câu khẳng định danh từ"],
    ["명사입니까", "Câu hỏi danh từ"],
    ["주제 표시", "Đánh dấu chủ đề"],
    ["주어 표시", "Đánh dấu chủ ngữ"],
    ["소유 표현", "Biểu hiện sở hữu"],
    ["자기소개", "Tự giới thiệu"],
    ["인사 표현", "Cách chào hỏi"],
    ["국적 말하기", "Nói quốc tịch"],
    ["직업 말하기", "Nói nghề nghiệp"],
    ["이름 묻기", "Hỏi tên"],
  ]),
  "학교": makeBank("학교", [
    ["위치 묻기", "Hỏi vị trí"],
    ["존재 말하기", "Nói có / ở"],
    ["부정 명사문", "Câu phủ định danh từ"],
    ["지시 표현", "Biểu hiện chỉ định"],
    ["장소 표현", "Biểu hiện nơi chốn"],
    ["물건 확인", "Xác nhận đồ vật"],
    ["교실 위치", "Vị trí trong lớp"],
    ["질문 만들기", "Tạo câu hỏi"],
    ["대답 만들기", "Tạo câu trả lời"],
    ["사물 설명", "Giải thích đồ vật"],
  ]),
  "일상생활": makeBank("일상생활", [
    ["격식체 서술", "Đuôi câu trần thuật trang trọng"],
    ["격식체 의문", "Đuôi câu hỏi trang trọng"],
    ["목적어 표시", "Đánh dấu tân ngữ"],
    ["장소에서 행동", "Hành động tại địa điểm"],
    ["이동 표현", "Biểu hiện di chuyển"],
    ["생활 동작", "Động tác sinh hoạt"],
    ["현재 습관", "Thói quen hiện tại"],
    ["동작 연결", "Liên kết động tác"],
    ["행동 묻기", "Hỏi hành động"],
    ["행동 대답", "Trả lời hành động"],
  ]),
  "날짜와 요일": makeBank("날짜와 요일", [
    ["요일에", "Vào thứ"],
    ["날짜 말하기", "Nói ngày tháng"],
    ["시간에", "Vào lúc"],
    ["오전 표현", "Buổi sáng"],
    ["오후 표현", "Buổi chiều"],
    ["시각 묻기", "Hỏi giờ"],
    ["기간 시작", "Bắt đầu khoảng thời gian"],
    ["기간 끝", "Kết thúc khoảng thời gian"],
    ["일정 말하기", "Nói lịch trình"],
    ["약속 확인", "Xác nhận cuộc hẹn"],
  ]),
  "하루 일과": makeBank("하루 일과", [
    ["해요체 서술", "Đuôi câu thân mật lịch sự"],
    ["부정 표현", "Câu phủ định ngắn"],
    ["시간 순서", "Thứ tự thời gian"],
    ["반복 습관", "Thói quen lặp lại"],
    ["하루 설명", "Miêu tả một ngày"],
    ["먼저 행동", "Hành động trước tiên"],
    ["다음 행동", "Hành động tiếp theo"],
    ["빈도 표현", "Tần suất"],
    ["장소 이동", "Đi đến địa điểm"],
    ["일과 묻기", "Hỏi lịch sinh hoạt"],
  ]),
  "주말": makeBank("주말", [
    ["과거 서술", "Câu quá khứ"],
    ["함께 행동", "Làm cùng ai"],
    ["권유 표현", "Câu rủ rê"],
    ["주말 경험", "Trải nghiệm cuối tuần"],
    ["지난 일", "Việc đã qua"],
    ["동반 표현", "Biểu hiện đi cùng"],
    ["감상 말하기", "Nói cảm tưởng"],
    ["바쁨 설명", "Giải thích bận"],
    ["피곤함 설명", "Giải thích mệt"],
    ["계획 제안", "Đề xuất kế hoạch"],
  ]),
  "물건 사기 (1)": makeBank("물건 사기", [
    ["가격 묻기", "Hỏi giá"],
    ["요청 표현", "Yêu cầu lịch sự"],
    ["희망 표현", "Muốn làm gì"],
    ["크기 설명", "Miêu tả kích cỡ"],
    ["가격 평가", "Đánh giá giá"],
    ["색깔 선택", "Chọn màu"],
    ["수량 말하기", "Nói số lượng"],
    ["구매 장소", "Nơi mua"],
    ["물건 비교", "So sánh đồ vật"],
    ["점원 대화", "Hội thoại với nhân viên"],
  ]),
  "음식": makeBank("음식", [
    ["주문 표현", "Gọi món"],
    ["맛 평가", "Đánh giá vị"],
    ["권유 표현", "Mời ăn/uống"],
    ["부정 맛 표현", "Nói vị không như vậy"],
    ["의지 표현", "Ý định sẽ làm"],
    ["정중 요청", "Yêu cầu lịch sự"],
    ["식당 대화", "Hội thoại nhà hàng"],
    ["추천 표현", "Gợi ý món"],
    ["먹기 지시", "Mời ăn"],
    ["마시기 지시", "Mời uống"],
  ]),
  "집": makeBank("집", [
    ["앞 위치", "Vị trí phía trước"],
    ["뒤 위치", "Vị trí phía sau"],
    ["옆 위치", "Vị trí bên cạnh"],
    ["반대쪽 위치", "Vị trí đối diện"],
    ["방향 안내", "Chỉ đường"],
    ["목적 이동", "Đi để làm gì"],
    ["추가 표현", "Cũng có"],
    ["거리 평가", "Đánh giá khoảng cách"],
    ["주거 설명", "Miêu tả nơi sống"],
    ["집 구조", "Cấu trúc nhà"],
  ]),
  "가족": makeBank("가족", [
    ["높임 주어", "Chủ ngữ kính ngữ"],
    ["높임 서술", "Vị ngữ kính ngữ"],
    ["높임 명령", "Mệnh lệnh kính ngữ"],
    ["높임 존재", "Có/ở kính ngữ"],
    ["높임 식사", "Ăn/uống kính ngữ"],
    ["높임 수면", "Ngủ kính ngữ"],
    ["존칭 나이", "Tuổi kính ngữ"],
    ["존칭 이름", "Tên kính ngữ"],
    ["존칭 생일", "Sinh nhật kính ngữ"],
    ["존칭 집", "Nhà kính ngữ"],
  ]),
  "날씨": makeBank("날씨", [
    ["날씨 묻기", "Hỏi thời tiết"],
    ["더위 설명", "Miêu tả nóng"],
    ["추위 설명", "Miêu tả lạnh"],
    ["따뜻함 설명", "Miêu tả ấm"],
    ["시원함 설명", "Miêu tả mát"],
    ["비 상황", "Tình huống mưa"],
    ["눈 상황", "Tình huống tuyết"],
    ["기간 시작", "Từ khi"],
    ["기간 끝", "Đến khi"],
    ["미래 계획", "Kế hoạch tương lai"],
  ]),
  "전화 (1)": makeBank("전화", [
    ["의도 표현", "Định làm gì"],
    ["대조 연결", "Nối câu đối lập"],
    ["상태 변화", "Thay đổi trạng thái"],
    ["불가능 표현", "Không thể làm"],
    ["다시 요청", "Yêu cầu làm lại"],
    ["확인 요청", "Yêu cầu xác nhận"],
    ["통화 시작", "Bắt đầu cuộc gọi"],
    ["통화 종료", "Kết thúc cuộc gọi"],
    ["연락 목적", "Mục đích liên lạc"],
    ["메모 남기기", "Để lại ghi chú"],
  ]),
  "생일": makeBank("생일", [
    ["도움 표현", "Làm giúp/cho ai"],
    ["이유 표현", "Nêu lý do"],
    ["결과 표현", "Nêu kết quả"],
    ["불가능 표현", "Không thể làm"],
    ["축하 표현", "Chúc mừng"],
    ["초대 표현", "Mời"],
    ["선물 설명", "Miêu tả quà"],
    ["감사 표현", "Cảm ơn"],
    ["파티 안내", "Thông báo tiệc"],
    ["약속 거절", "Từ chối hẹn"],
  ]),
  "취미": makeBank("취미", [
    ["명사화 기", "Danh từ hóa -기"],
    ["명사화 는것", "Danh từ hóa 는 것"],
    ["선호 표현", "Nói sở thích"],
    ["감상 표현", "Nói cảm nhận"],
    ["반복 활동", "Hoạt động lặp lại"],
    ["수집 활동", "Hoạt động sưu tầm"],
    ["경험 활동", "Hoạt động trải nghiệm"],
    ["능력 표현", "Nói khả năng"],
    ["관심 표현", "Nói sự quan tâm"],
    ["취미 묻기", "Hỏi sở thích"],
  ]),
  "교통": makeBank("교통", [
    ["수단 표현", "Biểu hiện phương tiện"],
    ["목적 이동", "Đi để làm gì"],
    ["의도 이동", "Định đi làm gì"],
    ["승차 표현", "Lên phương tiện"],
    ["하차 표현", "Xuống phương tiện"],
    ["환승 표현", "Chuyển tuyến"],
    ["귀가 표현", "Trở về"],
    ["길 안내", "Chỉ đường"],
    ["시간 소요", "Mất thời gian"],
    ["교통 비교", "So sánh giao thông"],
  ]),
};

const lessonFillFocus: Record<string, PracticeBankItem[]> = {
  "한글": makeBank("한글쓰기", [
    ["가나다", "Chuỗi âm tiết cơ bản"],
    ["마바사", "Luyện ghép phụ âm và nguyên âm"],
    ["아자차", "Luyện âm tiết có ㅇ/ㅈ/ㅊ"],
    ["카타파", "Luyện phụ âm bật hơi"],
    ["하나", "Từ luyện đọc đơn giản"],
    ["나라", "Từ luyện đọc đơn giản"],
    ["바다", "Từ luyện đọc đơn giản"],
    ["사자", "Từ luyện đọc đơn giản"],
    ["차표", "Từ luyện đọc đơn giản"],
    ["모자", "Từ luyện đọc đơn giản"],
  ]),
  "소개": makeBank("자기소개 완성", [
    ["처음뵙겠습니다", "Rất hân hạnh gặp lần đầu"],
    ["만나서반갑습니다", "Rất vui được gặp"],
    ["잘부탁드립니다", "Mong được giúp đỡ"],
    ["베트남에서왔습니다", "Tôi đến từ Việt Nam"],
    ["한국어를공부합니다", "Tôi học tiếng Hàn"],
    ["회사에다닙니다", "Tôi đi làm ở công ty"],
    ["대학생입니다", "Tôi là sinh viên đại học"],
    ["취미는독서입니다", "Sở thích là đọc sách"],
    ["고향은하노이입니다", "Quê là Hà Nội"],
    ["반갑게인사합니다", "Chào một cách vui vẻ"],
  ]),
  "학교": makeBank("교실 상황 완성", [
    ["교실에있습니다", "Ở trong lớp học"],
    ["책상위에있습니다", "Ở trên bàn học"],
    ["칠판앞에있습니다", "Ở trước bảng"],
    ["가방안에있습니다", "Ở trong cặp"],
    ["도서관에갑니다", "Đi thư viện"],
    ["화장실이어디입니까", "Nhà vệ sinh ở đâu"],
    ["컴퓨터를사용합니다", "Sử dụng máy tính"],
    ["문을엽니다", "Mở cửa"],
    ["창문을닫습니다", "Đóng cửa sổ"],
    ["사전을찾습니다", "Tra từ điển"],
  ]),
  "일상생활": makeBank("생활 문장 완성", [
    ["아침에갑니다", "Đi vào buổi sáng"],
    ["저녁에옵니다", "Đến vào buổi tối"],
    ["식당에서먹습니다", "Ăn ở nhà ăn"],
    ["집에서쉽니다", "Nghỉ ở nhà"],
    ["회사에서일합니다", "Làm việc ở công ty"],
    ["도서관에서읽습니다", "Đọc ở thư viện"],
    ["음악을듣습니다", "Nghe nhạc"],
    ["영화를봅니다", "Xem phim"],
    ["친구를만납니다", "Gặp bạn"],
    ["물건을삽니다", "Mua đồ"],
  ]),
  "날짜와 요일": makeBank("일정 문장 완성", [
    ["월요일에수업이있습니다", "Thứ hai có lớp"],
    ["화요일에시험이있습니다", "Thứ ba có thi"],
    ["수요일에약속이있습니다", "Thứ tư có hẹn"],
    ["오전에회의가있습니다", "Buổi sáng có họp"],
    ["오후에공부합니다", "Buổi chiều học"],
    ["주말에쉽니다", "Cuối tuần nghỉ"],
    ["생일은일요일입니다", "Sinh nhật là chủ nhật"],
    ["방학은내일부터입니다", "Kỳ nghỉ bắt đầu từ mai"],
    ["수업은까지입니다", "Lớp học đến khi"],
    ["오늘날짜를말합니다", "Nói ngày hôm nay"],
  ]),
  "하루 일과": makeBank("일과 문장 완성", [
    ["일곱시에일어나요", "Thức dậy lúc 7 giờ"],
    ["아침에세수해요", "Rửa mặt buổi sáng"],
    ["학교에가요", "Đi học"],
    ["수업후에공부해요", "Học sau giờ học"],
    ["오후에운동해요", "Tập thể dục buổi chiều"],
    ["저녁에숙제해요", "Làm bài tập buổi tối"],
    ["밤에쉬어요", "Nghỉ buổi đêm"],
    ["열한시에자요", "Ngủ lúc 11 giờ"],
    ["가끔신문을봐요", "Thỉnh thoảng đọc báo"],
    ["친구에게전화해요", "Gọi điện cho bạn"],
  ]),
  "주말": makeBank("주말 문장 완성", [
    ["토요일에영화를봤어요", "Thứ bảy đã xem phim"],
    ["일요일에친구를만났어요", "Chủ nhật đã gặp bạn"],
    ["공원에갔어요", "Đã đi công viên"],
    ["식당에서먹었어요", "Đã ăn ở nhà hàng"],
    ["집에서쉬었어요", "Đã nghỉ ở nhà"],
    ["쇼핑을했어요", "Đã mua sắm"],
    ["같이공부합시다", "Hãy cùng học"],
    ["음악을들었어요", "Đã nghe nhạc"],
    ["사진을찍었어요", "Đã chụp ảnh"],
    ["숙제를했습니다", "Đã làm bài tập"],
  ]),
  "물건 사기 (1)": makeBank("쇼핑 문장 완성", [
    ["이거얼마예요", "Cái này bao nhiêu"],
    ["하나주세요", "Cho tôi một cái"],
    ["큰것을사고싶어요", "Muốn mua cái lớn"],
    ["작은것도있어요", "Cũng có cái nhỏ"],
    ["너무비싸요", "Quá đắt"],
    ["조금싸요", "Hơi rẻ"],
    ["빨간색으로주세요", "Cho màu đỏ"],
    ["가게에서샀어요", "Đã mua ở cửa hàng"],
    ["돈을냈어요", "Đã trả tiền"],
    ["물건을골랐어요", "Đã chọn đồ"],
  ]),
  "음식": makeBank("식당 문장 완성", [
    ["메뉴를보겠습니다", "Tôi sẽ xem thực đơn"],
    ["비빔밥을주문하겠습니다", "Tôi sẽ gọi bibimbap"],
    ["물좀주세요", "Cho tôi chút nước"],
    ["맛있게드세요", "Chúc ăn ngon"],
    ["맵지않게해주세요", "Làm không cay giúp tôi"],
    ["달지않아요", "Không ngọt"],
    ["식당에갑니다", "Đi nhà hàng"],
    ["배가고픕니다", "Đói bụng"],
    ["배가부릅니다", "No bụng"],
    ["차를마시겠습니다", "Tôi sẽ uống trà"],
  ]),
  "집": makeBank("길과 집 문장 완성", [
    ["오른쪽으로가세요", "Đi sang phải"],
    ["왼쪽으로가세요", "Đi sang trái"],
    ["앞에서기다려요", "Chờ phía trước"],
    ["뒤에있어요", "Ở phía sau"],
    ["옆으로오세요", "Hãy đến bên cạnh"],
    ["반대쪽에있어요", "Ở phía đối diện"],
    ["집에살아요", "Sống ở nhà"],
    ["공원에가고싶어요", "Muốn đi công viên"],
    ["수영하러가요", "Đi để bơi"],
    ["회사가멀어요", "Công ty xa"],
  ]),
  "가족": makeBank("가족 높임 완성", [
    ["아버지께서오세요", "Bố đến, kính ngữ"],
    ["어머니께서계세요", "Mẹ ở, kính ngữ"],
    ["할아버지께서드세요", "Ông ăn, kính ngữ"],
    ["할머니께서주무세요", "Bà ngủ, kính ngữ"],
    ["성함이어떻게되세요", "Quý danh là gì"],
    ["연세가어떻게되세요", "Tuổi kính ngữ là bao nhiêu"],
    ["댁이어디세요", "Nhà kính ngữ ở đâu"],
    ["생신을축하드려요", "Chúc mừng sinh nhật kính ngữ"],
    ["말씀을들었어요", "Đã nghe lời nói kính ngữ"],
    ["편찮으세요", "Bị ốm, kính ngữ"],
  ]),
  "날씨": makeBank("날씨 문장 완성", [
    ["오늘날씨가좋아요", "Thời tiết hôm nay đẹp"],
    ["여름은더워요", "Mùa hè nóng"],
    ["겨울은추워요", "Mùa đông lạnh"],
    ["봄은따뜻해요", "Mùa xuân ấm"],
    ["가을은시원해요", "Mùa thu mát"],
    ["비가많이와요", "Mưa nhiều"],
    ["눈이조금와요", "Tuyết rơi một chút"],
    ["우산을가져가세요", "Hãy mang ô"],
    ["바다에갈거예요", "Sẽ đi biển"],
    ["방학부터쉴거예요", "Sẽ nghỉ từ kỳ nghỉ"],
  ]),
  "전화 (1)": makeBank("전화 문장 완성", [
    ["전화를걸려고해요", "Định gọi điện"],
    ["문자를보내려고해요", "Định gửi tin nhắn"],
    ["메일을확인하려고해요", "Định kiểm tra email"],
    ["전화했지만안받았어요", "Đã gọi nhưng không nhận"],
    ["파일을보냈지만열리지않아요", "Đã gửi file nhưng không mở"],
    ["휴대폰이고장났어요", "Điện thoại bị hỏng"],
    ["배터리가꺼졌어요", "Pin tắt/hết"],
    ["나중에다시전화해요", "Lát nữa gọi lại"],
    ["주소를보내주세요", "Hãy gửi địa chỉ"],
    ["알림이울렸어요", "Thông báo đã kêu"],
  ]),
  "생일": makeBank("생일 문장 완성", [
    ["선물을사주었어요", "Đã mua quà cho"],
    ["꽃을보내주었어요", "Đã gửi hoa cho"],
    ["케이크를만들어주었어요", "Đã làm bánh cho"],
    ["생일을축하해요", "Chúc mừng sinh nhật"],
    ["파티에초대했어요", "Đã mời tới tiệc"],
    ["비때문에못갔어요", "Không đi được vì mưa"],
    ["바빠서못샀어요", "Không mua được vì bận"],
    ["그래서카드를썼어요", "Vì vậy đã viết thiệp"],
    ["노래를불러주었어요", "Đã hát cho"],
    ["친구에게받았어요", "Đã nhận từ bạn"],
  ]),
  "취미": makeBank("취미 문장 완성", [
    ["여행하기를좋아해요", "Thích đi du lịch"],
    ["노래듣는것을좋아해요", "Thích nghe nhạc"],
    ["걷기가재미있어요", "Đi bộ thú vị"],
    ["요리하는것을배워요", "Học việc nấu ăn"],
    ["우표수집을해요", "Sưu tầm tem"],
    ["사진찍기를좋아해요", "Thích chụp ảnh"],
    ["드라마보는것이재미있어요", "Xem phim thú vị"],
    ["아침마다걸어요", "Đi bộ mỗi sáng"],
    ["문화를체험해요", "Trải nghiệm văn hóa"],
    ["질문을묻습니다", "Hỏi câu hỏi"],
  ]),
  "교통": makeBank("교통 문장 완성", [
    ["버스로가요", "Đi bằng xe buýt"],
    ["지하철로갈아타요", "Chuyển sang tàu điện ngầm"],
    ["택시를타요", "Đi taxi"],
    ["기차에서내려요", "Xuống tàu"],
    ["비행기로가려고해요", "Định đi bằng máy bay"],
    ["고향에돌아가요", "Trở về quê"],
    ["시험장에가요", "Đi đến phòng thi"],
    ["점심을먹으러가요", "Đi ăn trưa"],
    ["운동장으로가세요", "Hãy đi về phía sân vận động"],
    ["회사앞에서만나요", "Gặp trước công ty"],
  ]),
};

function makeBank(topic: string, rows: string[][]): PracticeBankItem[] {
  return rows.map(([answer, meaning], index) => ({
    answer,
    meaning,
    hint: meaning,
    prompt: `${topic} 상황 ${index + 1}`,
  }));
}

const buildWorkbookSentencePatterns = (
  topic: string,
  reserved: Set<string>
): LessonSeed["sentencePatterns"] => {
  const bank = makeSeparatedBank(
    lessonSentenceFocus[topic] ?? makeDefaultSentenceBank(topic),
    reserved,
    "문법"
  );

  return Array.from({ length: QUESTION_COUNT_PER_TYPE }, (_, index) => {
    const item = bank[index % bank.length];
    const options = makeRotatedOptions(
      item.answer,
      bank.filter((option) => option.answer !== item.answer).map((option) => option.answer),
      index
    );

    return {
      sentence: makeSentencePrompt(topic, item, index),
      meaning: item.meaning,
      answer: item.answer,
      options,
    };
  });
};

const buildWorkbookFillPatterns = (
  topic: string,
  reserved: Set<string>
): LessonSeed["fillPatterns"] => {
  const bank = makeSeparatedBank(
    lessonFillFocus[topic] ?? makeDefaultFillBank(topic),
    reserved,
    "문장"
  );

  return Array.from({ length: QUESTION_COUNT_PER_TYPE }, (_, index) => {
    const item = bank[index % bank.length];

    return {
      before: makeFillBefore(topic, item, index),
      after: makeFillAfter(topic, index),
      meaning: item.meaning,
      answer: item.answer,
      hint: item.hint,
      accepted: [item.answer],
    };
  });
};

const makeSeparatedBank = (
  bank: PracticeBankItem[],
  reserved: Set<string>,
  suffix: string
) => {
  return bank.map((item, index) => {
    const key = normalizeKey(item.answer);
    if (!reserved.has(key)) return item;

    return {
      ...item,
      answer: `${item.answer}${suffix}${index + 1}`.replace(/\s+/g, ""),
    };
  });
};

const makeDefaultSentenceBank = (topic: string) =>
  makeBank(topic, [
    ["문법선택", "Chọn cấu trúc ngữ pháp phù hợp"],
    ["상황표현", "Chọn biểu hiện theo tình huống"],
    ["질문형", "Tạo dạng câu hỏi"],
    ["대답형", "Tạo dạng câu trả lời"],
    ["연결표현", "Chọn biểu hiện nối câu"],
    ["높임표현", "Chọn biểu hiện lịch sự"],
    ["부정표현", "Chọn biểu hiện phủ định"],
    ["시간표현", "Chọn biểu hiện thời gian"],
    ["장소표현", "Chọn biểu hiện địa điểm"],
    ["목적표현", "Chọn biểu hiện mục đích"],
  ]);

const makeDefaultFillBank = (topic: string) =>
  makeBank(topic, [
    ["문장을완성합니다", "Hoàn thành câu"],
    ["자연스럽게말합니다", "Nói tự nhiên"],
    ["상황에맞게씁니다", "Viết đúng tình huống"],
    ["정중하게말합니다", "Nói lịch sự"],
    ["질문을만듭니다", "Tạo câu hỏi"],
    ["대답을만듭니다", "Tạo câu trả lời"],
    ["이유를말합니다", "Nói lý do"],
    ["계획을말합니다", "Nói kế hoạch"],
    ["경험을말합니다", "Nói trải nghiệm"],
    ["위치를말합니다", "Nói vị trí"],
  ]);

const makeRotatedOptions = (answer: string, optionSource: string[], index: number) => {
  const source = optionSource.length > 0 ? optionSource : [answer];
  const wrongOptions = Array.from({ length: 3 }, (_, wrongIndex) => {
    return source[(index + wrongIndex) % source.length];
  });
  const options = [answer, ...wrongOptions];
  return rotateOptions(options, index).slice(0, 4);
};

const makeSentencePrompt = (
  topic: string,
  item: PracticeBankItem,
  index: number
) => {
  if (topic === "한글") {
    return `${item.prompt}: 알맞은 읽기/쓰기 개념은 ____입니다.`;
  }

  const templates = [
    `${item.prompt}: 이 상황에 맞는 문법/표현은 ____입니다.`,
    `${topic} 대화에서 자연스러운 구조를 고르세요: ____`,
    `${item.prompt}: 문장을 완성하는 알맞은 말은 ____입니다.`,
    `${topic}에서 배운 문형 중 가장 알맞은 것은 ____입니다.`,
  ];

  return templates[index % templates.length];
};

const makeFillBefore = (topic: string, item: PracticeBankItem, index: number) => {
  if (topic === "한글") return `${item.prompt}: `;

  const templates = [
    `${item.prompt}: `,
    `다음 ${topic} 문장을 완성하세요: `,
    `상황에 맞게 빈칸을 채우세요: `,
    `배운 문장 구조를 사용하세요: `,
  ];

  return templates[index % templates.length];
};

const makeFillAfter = (topic: string, index: number) => {
  if (topic === "한글") return "을/를 쓰세요.";

  const endings = ["요.", "입니다.", "라고 말합니다.", "라고 씁니다."];
  return endings[index % endings.length];
};

const sc1WorkbookLessonSeeds: Record<string, LessonSource> = {
  "Luyện tập bảng chữ cái|Bảng chữ cái": makeWorkbookSeed("한글", [
    ["ㅏ", "nguyên âm a"], ["ㅑ", "nguyên âm ya"], ["ㅓ", "nguyên âm eo"], ["ㅕ", "nguyên âm yeo"], ["ㅗ", "nguyên âm o"],
    ["ㅛ", "nguyên âm yo"], ["ㅜ", "nguyên âm u"], ["ㅠ", "nguyên âm yu"], ["ㅡ", "nguyên âm eu"], ["ㅣ", "nguyên âm i"],
    ["ㄱ", "phụ âm g/k"], ["ㄴ", "phụ âm n"], ["ㄷ", "phụ âm d/t"], ["ㄹ", "phụ âm r/l"], ["ㅁ", "phụ âm m"],
    ["ㅂ", "phụ âm b/p"], ["ㅅ", "phụ âm s"], ["ㅇ", "phụ âm ng / âm câm đầu âm tiết"], ["ㅈ", "phụ âm j"], ["ㅊ", "phụ âm ch"],
    ["ㅋ", "phụ âm kh"], ["ㅌ", "phụ âm th"], ["ㅍ", "phụ âm ph"], ["ㅎ", "phụ âm h"], ["가", "ga / ka"],
    ["나", "na"], ["다", "da / ta"], ["라", "ra / la"], ["마", "ma"], ["바", "ba / pa"],
  ]),
  "Sơ cấp 1A|Bài 1": makeWorkbookSeed("소개", [
    ["저", "tôi"], ["제", "của tôi"], ["이름", "tên"], ["학생", "học sinh"], ["선생님", "giáo viên"],
    ["사람", "người"], ["친구", "bạn"], ["집", "nhà"], ["책", "sách"], ["음식", "món ăn"],
    ["한국", "Hàn Quốc"], ["베트남", "Việt Nam"], ["일본", "Nhật Bản"], ["미국", "Mỹ"], ["중국", "Trung Quốc"],
    ["고향", "quê hương"], ["부모님", "bố mẹ"], ["전통 옷", "áo truyền thống"], ["비빔밥", "cơm trộn"], ["아오자이", "áo dài"],
    ["입니다", "là"], ["입니까", "có phải là không"], ["은/는", "trợ từ chủ đề"], ["여기", "ở đây"], ["이것", "cái này"],
    ["한국어", "tiếng Hàn"], ["여자 친구", "bạn gái"], ["남자 친구", "bạn trai"], ["외국인", "người nước ngoài"], ["회사원", "nhân viên công ty"],
  ]),
  "Sơ cấp 1A|Bài 2": makeWorkbookSeed("학교", [
    ["학교", "trường học"], ["교실", "phòng học"], ["학생", "học sinh"], ["선생님", "giáo viên"], ["책상", "bàn học"],
    ["의자", "ghế"], ["칠판", "bảng"], ["시계", "đồng hồ"], ["가방", "cặp"], ["책", "sách"],
    ["공책", "vở"], ["연필", "bút chì"], ["볼펜", "bút bi"], ["지우개", "cục tẩy"], ["사전", "từ điển"],
    ["이것", "cái này"], ["그것", "cái đó"], ["저것", "cái kia"], ["여기", "chỗ này"], ["거기", "chỗ đó"],
    ["저기", "chỗ kia"], ["에", "ở / vào"], ["있습니다", "có / ở"], ["아닙니다", "không phải"], ["무엇", "cái gì"],
    ["도서관", "thư viện"], ["화장실", "nhà vệ sinh"], ["컴퓨터", "máy tính"], ["문", "cửa"], ["창문", "cửa sổ"],
  ]),
  "Sơ cấp 1A|Bài 3": makeWorkbookSeed("일상생활", [
    ["가다", "đi"], ["오다", "đến"], ["자다", "ngủ"], ["먹다", "ăn"], ["마시다", "uống"],
    ["이야기하다", "nói chuyện"], ["읽다", "đọc"], ["듣다", "nghe"], ["보다", "xem / nhìn"], ["일하다", "làm việc"],
    ["공부하다", "học"], ["운동하다", "tập thể dục"], ["쉬다", "nghỉ ngơi"], ["만나다", "gặp"], ["사다", "mua"],
    ["책", "sách"], ["음악", "âm nhạc"], ["영화", "phim"], ["밥", "cơm"], ["물", "nước"],
    ["집", "nhà"], ["학교", "trường học"], ["회사", "công ty"], ["식당", "nhà ăn"], ["도서관", "thư viện"],
    ["습니다", "đuôi câu trang trọng"], ["습니까", "đuôi câu hỏi trang trọng"], ["을/를", "trợ từ tân ngữ"], ["에서", "ở / tại"], ["갑니다", "đi"],
  ]),
  "Sơ cấp 1A|Bài 4": makeWorkbookSeed("날짜와 요일", [
    ["날짜", "ngày tháng"], ["요일", "thứ"], ["월요일", "thứ hai"], ["화요일", "thứ ba"], ["수요일", "thứ tư"],
    ["목요일", "thứ năm"], ["금요일", "thứ sáu"], ["토요일", "thứ bảy"], ["일요일", "chủ nhật"], ["오늘", "hôm nay"],
    ["내일", "ngày mai"], ["어제", "hôm qua"], ["생일", "sinh nhật"], ["수업", "buổi học"], ["시험", "kỳ thi"],
    ["약속", "cuộc hẹn"], ["오전", "buổi sáng / AM"], ["오후", "buổi chiều / PM"], ["시", "giờ"], ["분", "phút"],
    ["일", "ngày"], ["월", "tháng"], ["년", "năm"], ["와/과", "và / với"], ["에", "vào / lúc"],
    ["주말", "cuối tuần"], ["한국어", "tiếng Hàn"], ["친구", "bạn"], ["회의", "cuộc họp"], ["방학", "kỳ nghỉ"],
  ]),
  "Sơ cấp 1A|Bài 5": makeWorkbookSeed("하루 일과", [
    ["하루", "một ngày"], ["일과", "công việc trong ngày"], ["일어나다", "thức dậy"], ["세수하다", "rửa mặt"], ["아침", "buổi sáng"],
    ["점심", "bữa trưa"], ["저녁", "buổi tối / bữa tối"], ["학교에 가다", "đi học"], ["공부하다", "học"], ["일하다", "làm việc"],
    ["운동하다", "tập thể dục"], ["숙제하다", "làm bài tập"], ["쉬다", "nghỉ"], ["자다", "ngủ"], ["보다", "xem"],
    ["매일", "mỗi ngày"], ["보통", "thường"], ["가끔", "thỉnh thoảng"], ["아/어요", "đuôi câu thân mật lịch sự"], ["에 가다", "đi đến"],
    ["안", "không"], ["커피", "cà phê"], ["신문", "báo"], ["음악", "âm nhạc"], ["친구", "bạn"],
    ["도서관", "thư viện"], ["회사", "công ty"], ["집", "nhà"], ["밤", "đêm"], ["전화하다", "gọi điện"],
  ]),
  "Sơ cấp 1A|Bài 6": makeWorkbookSeed("주말", [
    ["주말", "cuối tuần"], ["지난주", "tuần trước"], ["이번 주", "tuần này"], ["토요일", "thứ bảy"], ["일요일", "chủ nhật"],
    ["가다", "đi"], ["오다", "đến"], ["먹다", "ăn"], ["보다", "xem"], ["만나다", "gặp"],
    ["쉬다", "nghỉ"], ["공부하다", "học"], ["운동하다", "tập thể dục"], ["쇼핑하다", "mua sắm"], ["여행하다", "du lịch"],
    ["친구", "bạn"], ["영화", "phim"], ["공원", "công viên"], ["식당", "nhà hàng"], ["집", "nhà"],
    ["았/었/했", "đuôi quá khứ"], ["하고", "và / với"], ["읍시다", "hãy cùng"], ["같이", "cùng nhau"], ["재미있다", "thú vị"],
    ["바쁘다", "bận"], ["피곤하다", "mệt"], ["숙제", "bài tập"], ["음악", "âm nhạc"], ["사진", "ảnh"],
  ]),
  "Sơ cấp 1A|Bài 7": makeWorkbookSeed("물건 사기 (1)", [
    ["물건", "đồ vật"], ["사다", "mua"], ["팔다", "bán"], ["가격", "giá"], ["돈", "tiền"],
    ["원", "won"], ["얼마", "bao nhiêu tiền"], ["주세요", "xin hãy cho tôi"], ["옷", "quần áo"], ["가방", "túi / cặp"],
    ["구두", "giày tây"], ["운동화", "giày thể thao"], ["모자", "mũ"], ["치마", "váy"], ["바지", "quần"],
    ["크다", "to"], ["작다", "nhỏ"], ["예쁘다", "đẹp"], ["비싸다", "đắt"], ["싸다", "rẻ"],
    ["고 싶다", "muốn"], ["ㅂ 불규칙", "bất quy tắc ㅂ"], ["은/는", "trợ từ chủ đề"], ["시장", "chợ"], ["가게", "cửa hàng"],
    ["빨간색", "màu đỏ"], ["파란색", "màu xanh"], ["검은색", "màu đen"], ["하얀색", "màu trắng"], ["한 개", "một cái"],
  ]),
  "Sơ cấp 1B|Bài 8": makeWorkbookSeed("음식", [
    ["음식", "món ăn"], ["밥", "cơm"], ["김밥", "kimbap"], ["비빔밥", "cơm trộn"], ["김치", "kimchi"],
    ["냉면", "mì lạnh"], ["갈비", "sườn"], ["삼계탕", "gà hầm sâm"], ["삼겹살", "thịt ba chỉ"], ["녹차", "trà xanh"],
    ["순대", "sundae"], ["떡볶이", "tteokbokki"], ["맥주", "bia"], ["물", "nước"], ["맛있다", "ngon"],
    ["맵다", "cay"], ["달다", "ngọt"], ["짜다", "mặn"], ["먹다", "ăn"], ["마시다", "uống"],
    ["겠", "sẽ / chắc"], ["지 않다", "không"], ["으세요", "xin hãy"], ["식당", "nhà hàng"], ["메뉴", "thực đơn"],
    ["주문하다", "gọi món"], ["주세요", "xin hãy cho"], ["좋아하다", "thích"], ["배고프다", "đói"], ["배부르다", "no"],
  ]),
  "Sơ cấp 1B|Bài 9": makeWorkbookSeed("집", [
    ["집", "nhà"], ["방", "phòng"], ["거실", "phòng khách"], ["부엌", "bếp"], ["화장실", "nhà vệ sinh"],
    ["침실", "phòng ngủ"], ["시장", "chợ"], ["경찰서", "đồn cảnh sát"], ["병원", "bệnh viện"], ["수영장", "bể bơi"],
    ["공원", "công viên"], ["대학교", "trường đại học"], ["회사", "công ty"], ["앞", "trước"], ["뒤", "sau"],
    ["옆", "bên cạnh"], ["반대쪽", "phía đối diện"], ["으로/로", "về phía / bằng"], ["으러 가요", "đi để làm"], ["도", "cũng"],
    ["가깝다", "gần"], ["멀다", "xa"], ["오른쪽", "bên phải"], ["왼쪽", "bên trái"], ["있다", "ở / có"],
    ["가고 싶다", "muốn đi"], ["찾다", "tìm"], ["살다", "sống"], ["깨끗하다", "sạch"], ["넓다", "rộng"],
  ]),
  "Sơ cấp 1B|Bài 10": makeWorkbookSeed("가족", [
    ["가족", "gia đình"], ["아버지", "bố"], ["어머니", "mẹ"], ["할아버지", "ông"], ["할머니", "bà"],
    ["동생", "em"], ["형", "anh trai của nam"], ["오빠", "anh trai của nữ"], ["누나", "chị gái của nam"], ["언니", "chị gái của nữ"],
    ["성함", "quý danh"], ["연세", "tuổi kính ngữ"], ["생신", "sinh nhật kính ngữ"], ["댁", "nhà kính ngữ"], ["말씀", "lời nói kính ngữ"],
    ["병환", "bệnh kính ngữ"], ["어르신", "người lớn tuổi"], ["께서", "trợ từ chủ ngữ kính ngữ"], ["으시", "kính ngữ"], ["ㄷ 불규칙", "bất quy tắc ㄷ"],
    ["나이", "tuổi"], ["몇 명", "mấy người"], ["살", "tuổi"], ["계시다", "có / ở kính ngữ"], ["드시다", "ăn/uống kính ngữ"],
    ["주무시다", "ngủ kính ngữ"], ["편찮으시다", "ốm kính ngữ"], ["생일", "sinh nhật"], ["직업", "nghề nghiệp"], ["회사원", "nhân viên công ty"],
  ]),
  "Sơ cấp 1B|Bài 11": makeWorkbookSeed("날씨", [
    ["날씨", "thời tiết"], ["계절", "mùa"], ["봄", "mùa xuân"], ["여름", "mùa hè"], ["가을", "mùa thu"],
    ["겨울", "mùa đông"], ["비", "mưa"], ["눈", "tuyết"], ["구름", "mây"], ["바람", "gió"],
    ["기온", "nhiệt độ"], ["덥다", "nóng"], ["춥다", "lạnh"], ["따뜻하다", "ấm áp"], ["시원하다", "mát mẻ"],
    ["좋아하다", "thích"], ["많이", "nhiều"], ["조금", "một chút"], ["고", "và"], ["부터", "từ"],
    ["까지", "đến"], ["으로 거예요", "sẽ / dự định"], ["ㅂ 불규칙", "bất quy tắc ㅂ"], ["하늘", "bầu trời"], ["바다", "biển"],
    ["옷", "quần áo"], ["우산", "ô / dù"], ["방학", "kỳ nghỉ"], ["눈이 오다", "tuyết rơi"], ["비가 오다", "mưa rơi"],
  ]),
  "Sơ cấp 1B|Bài 12": makeWorkbookSeed("전화 (1)", [
    ["전화", "điện thoại"], ["휴대폰", "điện thoại di động"], ["배터리", "pin"], ["메시지", "tin nhắn"], ["문자", "tin nhắn"],
    ["메일", "email"], ["주소", "địa chỉ"], ["파일", "tệp"], ["알림", "chuông báo"], ["소방서", "trạm cứu hỏa"],
    ["전화를 걸다", "gọi điện"], ["전화를 받다", "nhận điện thoại"], ["전화를 끊다", "cúp điện thoại"], ["보내다", "gửi"], ["확인하다", "xác nhận"],
    ["고장나다", "bị hỏng"], ["꺼지다", "tắt"], ["열리다", "mở ra"], ["깨다", "thức giấc"], ["려고 하다", "định làm"],
    ["지만", "nhưng"], ["계속", "tiếp tục"], ["아침", "buổi sáng"], ["가족", "gia đình"], ["요리하다", "nấu ăn"],
    ["바쁘다", "bận"], ["운동하다", "tập thể dục"], ["전화번호", "số điện thoại"], ["인터넷", "internet"], ["컴퓨터", "máy tính"],
  ]),
  "Sơ cấp 1B|Bài 13": makeWorkbookSeed("생일", [
    ["생일", "sinh nhật"], ["생일 파티", "tiệc sinh nhật"], ["선물", "quà"], ["꽃", "hoa"], ["케이크", "bánh kem"],
    ["축하하다", "chúc mừng"], ["초대하다", "mời"], ["받다", "nhận"], ["주다", "cho"], ["노래를 부르다", "hát"],
    ["때문에", "vì"], ["그래서", "vì vậy"], ["아/어 주다", "làm giúp / làm cho"], ["못", "không thể"], ["바쁘다", "bận"],
    ["비", "mưa"], ["늦다", "muộn"], ["어렵다", "khó"], ["쉽다", "dễ"], ["돈", "tiền"],
    ["백화점", "trung tâm thương mại"], ["사전", "từ điển"], ["옷", "quần áo"], ["친구", "bạn"], ["음악", "âm nhạc"],
    ["춤", "nhảy"], ["음식", "món ăn"], ["초", "nến"], ["카드", "thiệp"], ["사진", "ảnh"],
  ]),
  "Sơ cấp 1B|Bài 14": makeWorkbookSeed("취미", [
    ["취미", "sở thích"], ["여행하다", "du lịch"], ["노래를 듣다", "nghe nhạc"], ["노래를 부르다", "hát"], ["걷다", "đi bộ"],
    ["한국 드라마", "phim truyền hình Hàn"], ["문법", "ngữ pháp"], ["우표", "tem"], ["수집하다", "sưu tầm"], ["요리하다", "nấu ăn"],
    ["고양이를 키우다", "nuôi mèo"], ["운동하다", "tập thể dục"], ["춤을 추다", "nhảy"], ["책을 읽다", "đọc sách"], ["사진을 찍다", "chụp ảnh"],
    ["기", "danh từ hóa động từ"], ["는 것", "việc làm gì"], ["ㄷ 불규칙", "bất quy tắc ㄷ"], ["좋아하다", "thích"], ["재미있다", "thú vị"],
    ["매일", "mỗi ngày"], ["아침", "buổi sáng"], ["정보", "thông tin"], ["문화", "văn hóa"], ["체험하다", "trải nghiệm"],
    ["받다", "nhận"], ["듣다", "nghe"], ["묻다", "hỏi"], ["깨닫다", "nhận ra"], ["열다", "mở"],
  ]),
  "Sơ cấp 1B|Bài 15": makeWorkbookSeed("교통", [
    ["교통", "giao thông"], ["버스", "xe buýt"], ["지하철", "tàu điện ngầm"], ["택시", "taxi"], ["기차", "tàu hỏa"],
    ["비행기", "máy bay"], ["배", "tàu thủy"], ["자전거", "xe đạp"], ["자동차", "ô tô"], ["KTX", "tàu KTX"],
    ["시장", "chợ"], ["운동장", "sân vận động"], ["식당", "nhà hàng"], ["학교 앞", "trước trường"], ["회사", "công ty"],
    ["고향", "quê hương"], ["돌아가다", "trở về"], ["가다", "đi"], ["오다", "đến"], ["늦다", "muộn"],
    ["으러 가다", "đi để làm"], ["으려고 하다", "định làm"], ["으로 가다", "đi bằng / về phía"], ["타다", "đi / lên xe"], ["내리다", "xuống xe"],
    ["갈아타다", "chuyển xe"], ["시험장", "phòng thi"], ["부산", "Busan"], ["여행", "du lịch"], ["점심", "bữa trưa"],
  ]),
};

const rawLessonSeeds: Record<string, LessonSource> = {
  ...lessonSeeds,
  ...extraLessonSeeds,
  ...sc1WorkbookLessonSeeds,
};

const expandVocabulary = (
  vocabulary: VocabItem[],
  sentencePatterns: LessonSeed["sentencePatterns"],
  fillPatterns: LessonSeed["fillPatterns"]
) => {
  const expanded = [...vocabulary];
  const seenWords = new Set(expanded.map((item) => normalizeKey(item.word)));
  const answerBasedItems = [
    ...sentencePatterns.map((question) => ({
      word: question.answer,
      meaning: `cách dùng trong câu: ${question.meaning}`,
    })),
    ...fillPatterns.map((question) => ({
      word: question.answer,
      meaning: question.hint,
    })),
  ];

  answerBasedItems.forEach((item) => {
    const key = normalizeKey(item.word);
    if (!seenWords.has(key) && expanded.length < QUESTION_COUNT_PER_TYPE) {
      expanded.push(item);
      seenWords.add(key);
    }
  });

  let index = 0;
  while (expanded.length < QUESTION_COUNT_PER_TYPE && vocabulary.length > 0) {
    const item = vocabulary[index % vocabulary.length];
    expanded.push({
      word: item.word,
      meaning: item.meaning,
    });
    index += 1;
  }

  return expanded.slice(0, QUESTION_COUNT_PER_TYPE);
};

const expandSentenceChoiceQuestions = (
  questions: SentenceChoiceQuestion[],
  vocabulary: VocabItem[]
) => {
  const expanded = [...questions];
  let index = 0;

  while (expanded.length < QUESTION_COUNT_PER_TYPE && questions.length > 0) {
    const base = questions[index % questions.length];
    const extraOptions = vocabulary
      .map((item) => item.word)
      .filter((word) => normalizeKey(word) !== normalizeKey(base.answer))
      .slice(index % Math.max(vocabulary.length - 3, 1), index % Math.max(vocabulary.length - 3, 1) + 3);
    const options = rotateOptions(
      [base.answer, ...extraOptions].slice(0, 4),
      expanded.length
    );

    while (options.length < 4) {
      options.push(base.options[options.length % base.options.length] ?? base.answer);
    }

    expanded.push({
      ...base,
      options,
    });
    index += 1;
  }

  return expanded.slice(0, QUESTION_COUNT_PER_TYPE);
};

const expandFillBlankQuestions = (questions: FillBlankQuestion[]) => {
  const expanded = [...questions];
  let index = 0;

  while (expanded.length < QUESTION_COUNT_PER_TYPE && questions.length > 0) {
    const base = questions[index % questions.length];
    expanded.push({ ...base });
    index += 1;
  }

  return expanded.slice(0, QUESTION_COUNT_PER_TYPE);
};

function normalizeKey(value: string) {
  return value.trim().replace(/\s+/g, "");
}

const isPrebuiltLessonSeed = (seed: LessonSource): seed is PrebuiltLessonSeed => {
  return "sentenceChoiceQuestions" in seed && "fillBlankQuestions" in seed;
};

const buildLessonData = (key: string, seed: LessonSource): LessonExerciseData => {
  const sentenceChoiceQuestions = isPrebuiltLessonSeed(seed)
    ? seed.sentenceChoiceQuestions
    : seed.sentencePatterns.map((question) => ({
        sentence: question.sentence,
        meaning: question.meaning,
        answer: question.answer,
        options: question.options,
      }));

  const fillBlankQuestions = isPrebuiltLessonSeed(seed)
    ? seed.fillBlankQuestions
    : seed.fillPatterns.map((question) => ({
        sentenceBefore: question.before,
        sentenceAfter: question.after,
        meaning: question.meaning,
        answer: question.answer,
        acceptedAnswers: question.accepted ?? [question.answer],
        hint: question.hint,
      }));

  const sentencePatternsForVocabulary = sentenceChoiceQuestions.map((question) => ({
    sentence: question.sentence,
    meaning: question.meaning,
    answer: question.answer,
    options: question.options,
  }));

  const fillPatternsForVocabulary = fillBlankQuestions.map((question) => ({
    before: question.sentenceBefore,
    after: question.sentenceAfter,
    meaning: question.meaning,
    answer: question.answer,
    hint: question.hint,
    accepted: question.acceptedAnswers,
  }));

  return {
    title: key.replace("|", " - "),
    topic: seed.topic,
    vocabulary: expandVocabulary(
      seed.vocabulary,
      sentencePatternsForVocabulary,
      fillPatternsForVocabulary
    ),
    sentenceChoiceQuestions: expandSentenceChoiceQuestions(
      sentenceChoiceQuestions,
      seed.vocabulary
    ),
    fillBlankQuestions: expandFillBlankQuestions(fillBlankQuestions),
  };
};

const lessonExerciseData = Object.fromEntries(
  Object.entries(rawLessonSeeds).map(([key, seed]) => [key, buildLessonData(key, seed)])
) as Record<string, LessonExerciseData>;


const parseYonseiClozeText = (clozeText: string): YonseiClozePart[] => {
  const parts: YonseiClozePart[] = [];
  const pattern = /\[\[(\d+)\|([^\]]+)\]\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(clozeText)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", text: clozeText.slice(lastIndex, match.index) });
    }

    parts.push({
      type: "blank",
      number: Number(match[1]),
      answer: match[2],
    });

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < clozeText.length) {
    parts.push({ type: "text", text: clozeText.slice(lastIndex) });
  }

  return parts;
};

const getYonseiOriginalText = (clozeText: string) =>
  clozeText.replace(/\[\[(\d+)\|([^\]]+)\]\]/g, "$2");

function App() {
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>("morning");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [levelsOpen, setLevelsOpen] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>(null);
  const [vocabMode, setVocabMode] = useState<VocabMode>("meaning");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [studentName, setStudentName] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [savedMeaning, setSavedMeaning] = useState(false);
  const [savedSentenceChoice, setSavedSentenceChoice] = useState(false);
  const [exerciseNotice, setExerciseNotice] = useState("");
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [accessMessage, setAccessMessage] = useState("");
  const [unlockedLevels, setUnlockedLevels] = useState<Record<string, boolean>>(
    {}
  );
  const [selectedTopikTestId, setSelectedTopikTestId] = useState(
    topikReadingTests[0]?.id ?? ""
  );
  const [topikAnswers, setTopikAnswers] = useState<Record<string, TopikReadingAnswer>>({});
  const [topikConfirmedAnswers, setTopikConfirmedAnswers] = useState<Record<string, TopikReadingAnswer>>({});
  const [topikStudentName, setTopikStudentName] = useState("");
  const [topikSubmitMessage, setTopikSubmitMessage] = useState("");
  const [selectedYonseiLessonId, setSelectedYonseiLessonId] = useState(
    yonseiListeningLessons[0]?.id ?? ""
  );
  const [yonseiAnswers, setYonseiAnswers] = useState<Record<string, string>>({});
  const [yonseiChecked, setYonseiChecked] = useState(false);
  const [yonseiTranslation, setYonseiTranslation] = useState("");
  const [yonseiStudentName, setYonseiStudentName] = useState("");
  const [yonseiSubmitMessage, setYonseiSubmitMessage] = useState("");

  const selectedLessonKey = selectedLevel && selectedLesson ? `${selectedLevel}|${selectedLesson}` : "";
  const currentLessonData = selectedLessonKey ? lessonExerciseData[selectedLessonKey] : null;
  const selectedLevelIsProtected =
    Boolean(selectedLevel) &&
    !publicLearningLevels.includes(selectedLevel ?? "");
  const selectedLevelIsUnlocked =
    !selectedLevelIsProtected || Boolean(selectedLevel && unlockedLevels[selectedLevel]);
  const meaningQuestions = useMemo(
    () => currentLessonData?.vocabulary.slice(0, 30) ?? [],
    [currentLessonData]
  );
  const sentenceChoiceQuestions = currentLessonData?.sentenceChoiceQuestions ?? [];
  const fillBlankQuestions = currentLessonData?.fillBlankQuestions ?? [];
  const currentTopikTest = useMemo(
    () => topikReadingTests.find((test) => test.id === selectedTopikTestId) ?? topikReadingTests[0],
    [selectedTopikTestId]
  );
  const currentYonseiLesson = useMemo(
    () =>
      yonseiListeningLessons.find((lesson) => lesson.id === selectedYonseiLessonId) ??
      yonseiListeningLessons[0],
    [selectedYonseiLessonId]
  );
  const currentYonseiParts = useMemo(
    () => (currentYonseiLesson ? parseYonseiClozeText(currentYonseiLesson.clozeText) : []),
    [currentYonseiLesson]
  );
  const currentYonseiBlanks = useMemo(
    () => currentYonseiParts.filter((part): part is YonseiBlankPart => part.type === "blank"),
    [currentYonseiParts]
  );
  const currentExerciseTypes =
    selectedLevel === YONSEI_LISTENING_LEVEL
      ? yonseiExerciseTypes
      : selectedLevel === TOPIK_READING_LEVEL && selectedLesson === TOPIK_READING_LESSON
      ? topikExerciseTypes
      : exerciseTypes;
  const selectedTopikAnswerCount = currentTopikTest
    ? Array.from({ length: currentTopikTest.questionCount }).filter(
        (_, index) => topikAnswers[`${currentTopikTest.id}-${index + 1}`]
      ).length
    : 0;
  const confirmedTopikAnswerCount = currentTopikTest
    ? Array.from({ length: currentTopikTest.questionCount }).filter(
        (_, index) => topikConfirmedAnswers[`${currentTopikTest.id}-${index + 1}`]
      ).length
    : 0;
  const filledYonseiBlankCount = currentYonseiLesson
    ? currentYonseiBlanks.filter(
        (blank) => (yonseiAnswers[`${currentYonseiLesson.id}-${blank.number}`] ?? "").trim().length > 0
      ).length
    : 0;
  const isYonseiListeningReadyToCheck =
    currentYonseiBlanks.length > 0 && filledYonseiBlankCount === currentYonseiBlanks.length;

  useEffect(() => {
    const savedMode = localStorage.getItem("kaish-background-mode");

    if (savedMode === "morning" || savedMode === "afternoon" || savedMode === "night") {
      setBackgroundMode(savedMode);
    }
  }, []);

  const handleBackgroundChange = (mode: BackgroundMode) => {
    setBackgroundMode(mode);
    localStorage.setItem("kaish-background-mode", mode);
  };

  const resetVocabularyProgress = () => {
    setAnswers({});
    setStudentName("");
    setSubmitMessage("");
    setSavedMeaning(false);
    setSavedSentenceChoice(false);
    setVocabMode("meaning");
  };

  const resetTopikReadingProgress = (keepSelectedTest = true) => {
    setTopikAnswers({});
    setTopikConfirmedAnswers({});
    setTopikStudentName("");
    setTopikSubmitMessage("");
    if (!keepSelectedTest) {
      setSelectedTopikTestId(topikReadingTests[0]?.id ?? "");
    }
  };

  const resetYonseiListeningProgress = (keepSelectedLesson = true) => {
    setYonseiAnswers({});
    setYonseiChecked(false);
    setYonseiTranslation("");
    setYonseiStudentName("");
    setYonseiSubmitMessage("");
    if (!keepSelectedLesson) {
      setSelectedYonseiLessonId(yonseiListeningLessons[0]?.id ?? "");
    }
  };

  const resetAccessForm = () => {
    setAccessCodeInput("");
    setAccessMessage("");
  };

  const handleStartLearning = () => {
    setLevelsOpen((value) => !value);
    setSelectedLevel(null);
    setSelectedLesson(null);
    setSelectedExercise(null);
    resetAccessForm();
    resetVocabularyProgress();
    resetTopikReadingProgress(false);
    resetYonseiListeningProgress(false);
  };

  const handleLevelClick = (level: string) => {
    if (lessonsByLevel[level]) {
      setSelectedLevel(level);
      setSelectedLesson(null);
      setSelectedExercise(null);
      resetAccessForm();
      resetVocabularyProgress();
      resetTopikReadingProgress();
      resetYonseiListeningProgress(level === YONSEI_LISTENING_LEVEL);
      return;
    }

    alert(`${level} sẽ được xây dựng sau.`);
  };

  const handleCloseLayer = () => {
    setSelectedLevel(null);
    setSelectedLesson(null);
    setSelectedExercise(null);
    resetAccessForm();
    resetVocabularyProgress();
    resetTopikReadingProgress(false);
    resetYonseiListeningProgress(false);
  };

  const handleLessonClick = (lesson: string) => {
    if (!selectedLevelIsUnlocked) {
      setAccessMessage("Vui lòng nhập đúng mã giáo viên đã cung cấp trước khi chọn bài.");
      return;
    }

    if (selectedLevel === YONSEI_LISTENING_LEVEL) {
      const yonseiLesson = yonseiListeningLessons.find((item) => item.lessonLabel === lesson);
      if (yonseiLesson) {
        setSelectedYonseiLessonId(yonseiLesson.id);
      }
    }

    setSelectedLesson(lesson);
    setSelectedExercise(null);
    setExerciseNotice("");
    resetVocabularyProgress();
    resetTopikReadingProgress();
    resetYonseiListeningProgress();
  };

  const handleUnlockLevel = () => {
    if (!selectedLevel) return;

    if (accessCodeInput.trim() !== teacherAccessCode) {
      setAccessMessage("Mã chưa đúng. Hãy kiểm tra lại mã giáo viên đã cung cấp trong lớp học.");
      return;
    }

    setUnlockedLevels((prev) => ({
      ...prev,
      [selectedLevel]: true,
    }));
    setAccessMessage("");
    setAccessCodeInput("");
  };

  const handleExerciseClick = (exercise: ExerciseType) => {
    if (exercise === "topikReading") {
      setExerciseNotice("");
      setSelectedExercise("topikReading");
      resetVocabularyProgress();
      resetTopikReadingProgress();
      resetYonseiListeningProgress();
      return;
    }

    if (exercise === "yonseiListening") {
      setExerciseNotice("");
      setSelectedExercise("yonseiListening");
      resetVocabularyProgress();
      resetTopikReadingProgress();
      resetYonseiListeningProgress();
      return;
    }

    if (exercise !== "vocabulary") {
      setSelectedExercise(null);
      setExerciseNotice("Bạn cần làm bài tập từ vựng trước.");
      resetVocabularyProgress();
      resetTopikReadingProgress();
      resetYonseiListeningProgress();
      return;
    }

    setExerciseNotice("");
    setSelectedExercise(exercise);
    resetVocabularyProgress();
    resetTopikReadingProgress();
    resetYonseiListeningProgress();
  };


  const updateAnswerOnce = (key: string, value: string) => {
    setAnswers((prev) => {
      if (prev[key]) return prev;
      return { ...prev, [key]: value };
    });
  };

  const updateFillAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const normalizeKoreanAnswer = (value: string) => value.trim().replace(/\s+/g, "");

  const isFillAnswerCorrect = (question: FillBlankQuestion, typedAnswer: string) => {
    const normalizedTyped = normalizeKoreanAnswer(typedAnswer);

    return question.acceptedAnswers.some(
      (answer) => normalizeKoreanAnswer(answer) === normalizedTyped
    );
  };

  const getFillBoxCount = (question: FillBlankQuestion) => {
    return normalizeKoreanAnswer(question.answer).length;
  };

  const getMeaningOptions = (item: VocabItem, index: number) => {
    const source = currentLessonData?.vocabulary ?? [];
    const wrongOptions = source
      .filter((vocab) => vocab.meaning !== item.meaning)
      .slice(index + 1, index + 4)
      .map((vocab) => vocab.meaning);

    let fallbackIndex = 0;
    while (wrongOptions.length < 3) {
      const fallback = source[(index + fallbackIndex + 8) % source.length]?.meaning;
      if (fallback && fallback !== item.meaning && !wrongOptions.includes(fallback)) {
        wrongOptions.push(fallback);
      } else {
        wrongOptions.push("nghĩa khác");
      }
      fallbackIndex += 1;
    }

    const insertIndex = index % 4;
    const options = [...wrongOptions];
    options.splice(insertIndex, 0, item.meaning);
    return options.slice(0, 4);
  };

  const isMeaningDone = meaningQuestions.every((_, index) => answers[`meaning-${index}`]);

  const isSentenceChoiceDone = sentenceChoiceQuestions.every(
    (_, index) => answers[`sentence-${index}`]
  );

  const isFillBlankDone = fillBlankQuestions.every(
    (_, index) => (answers[`fill-${index}`] ?? "").trim().length > 0
  );

  const calculateScore = () => {
    let score = 0;
    let total = 0;
    const wrongQuestions: string[] = [];

    total += meaningQuestions.length;
    meaningQuestions.forEach((item, index) => {
      const key = `meaning-${index}`;
      const selected = answers[key];

      if (selected === item.meaning) {
        score += 1;
      } else {
        wrongQuestions.push(
          `[Dạng 1] ${index + 1}. ${item.word} | Chọn: ${
            selected || "chưa chọn"
          } | Đúng: ${item.meaning}`
        );
      }
    });

    total += sentenceChoiceQuestions.length;
    sentenceChoiceQuestions.forEach((question, index) => {
      const key = `sentence-${index}`;
      const selected = answers[key];

      if (selected === question.answer) {
        score += 1;
      } else {
        wrongQuestions.push(
          `[Dạng 2] ${index + 1}. ${question.sentence} | Chọn: ${
            selected || "chưa chọn"
          } | Đúng: ${question.answer} | Nghĩa: ${question.meaning}`
        );
      }
    });

    total += fillBlankQuestions.length;
    fillBlankQuestions.forEach((question, index) => {
      const key = `fill-${index}`;
      const typed = answers[key] ?? "";
      const isCorrect = isFillAnswerCorrect(question, typed);

      if (isCorrect) {
        score += 1;
      } else {
        wrongQuestions.push(
          `[Dạng 3] ${index + 1}. ${question.sentenceBefore}____${
            question.sentenceAfter
          } | Điền: ${typed || "chưa điền"} | Đúng: ${question.answer} | Nghĩa: ${
            question.meaning
          }`
        );
      }
    });

    return { score, total, wrongQuestions };
  };

  const calculateModeScore = (mode: VocabMode) => {
    let score = 0;
    let total = 0;

    if (mode === "meaning") {
      total = meaningQuestions.length;
      meaningQuestions.forEach((item, index) => {
        if (answers[`meaning-${index}`] === item.meaning) score += 1;
      });
    }

    if (mode === "sentenceChoice") {
      total = sentenceChoiceQuestions.length;
      sentenceChoiceQuestions.forEach((question, index) => {
        if (answers[`sentence-${index}`] === question.answer) score += 1;
      });
    }

    if (mode === "fillBlank") {
      total = fillBlankQuestions.length;
      fillBlankQuestions.forEach((question, index) => {
        const typed = answers[`fill-${index}`] ?? "";
        if (isFillAnswerCorrect(question, typed)) score += 1;
      });
    }

    return { score, total };
  };

  const handleSaveMeaning = () => {
    setSavedMeaning(true);
    setVocabMode("sentenceChoice");
    setSubmitMessage("");
  };

  const handleSaveSentenceChoice = () => {
    setSavedSentenceChoice(true);
    setVocabMode("fillBlank");
    setSubmitMessage("");
  };

  const handleSubmitVocabExercise = async () => {
    const { score, total, wrongQuestions } = calculateScore();

    if (!studentName.trim()) {
      setSubmitMessage("Vui lòng nhập tên học sinh trước khi nộp bài.");
      return;
    }

    const payload = {
      studentName: studentName.trim(),
      lesson: currentLessonData?.title ?? selectedLessonKey,
      exerciseMode: "Bài tập từ vựng - Tổng hợp 3 dạng",
      score,
      total,
      wrongCount: wrongQuestions.length,
      wrongQuestions: wrongQuestions.join("\n"),
    };

    try {
      const body = new URLSearchParams();
      body.append("payload", JSON.stringify(payload));

      console.log("Submitting quiz payload:", payload);

      await fetch(GOOGLE_SHEET_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        body,
      });

      setSubmitMessage(
        `Đã nộp bài. Điểm của bạn: ${score}/${total}. Yêu cầu đã được gửi tới Apps Script; nếu Google Sheet chưa hiện dòng mới, hãy Deploy lại Apps Script theo Code.gs mới.`
      );
    } catch (error) {
      console.error(error);
      setSubmitMessage(
        `Điểm của bạn: ${score}/${total}. Nhưng chưa gửi được Google Sheet, hãy kiểm tra Apps Script URL.`
      );
    }
  };



  const getTopikQuestionKey = (questionNumber: number) => {
    if (!currentTopikTest) return "";
    return `${currentTopikTest.id}-${questionNumber}`;
  };

  const formatTopikAnswer = (answer?: TopikReadingAnswer) => {
    if (answer === "1") return "①";
    if (answer === "2") return "②";
    if (answer === "3") return "③";
    if (answer === "4") return "④";
    return "-";
  };

  const updateTopikAnswer = (questionNumber: number, answer: TopikReadingAnswer) => {
    if (!currentTopikTest) return;

    const questionKey = getTopikQuestionKey(questionNumber);
    if (topikConfirmedAnswers[questionKey]) return;

    setTopikAnswers((prev) => ({
      ...prev,
      [questionKey]: answer,
    }));
    setTopikSubmitMessage("");
  };

  const getTopikAnswer = (questionNumber: number) => {
    if (!currentTopikTest) return undefined;
    return topikAnswers[getTopikQuestionKey(questionNumber)];
  };

  const getTopikConfirmedAnswer = (questionNumber: number) => {
    if (!currentTopikTest) return undefined;
    return topikConfirmedAnswers[getTopikQuestionKey(questionNumber)];
  };

  const confirmTopikAnswer = (questionNumber: number) => {
    if (!currentTopikTest) return;

    const selectedAnswer = getTopikAnswer(questionNumber);
    if (!selectedAnswer) {
      setTopikSubmitMessage(`Câu ${questionNumber}: hãy chọn ①, ②, ③ hoặc ④ trước khi xác nhận.`);
      return;
    }

    setTopikConfirmedAnswers((prev) => ({
      ...prev,
      [getTopikQuestionKey(questionNumber)]: selectedAnswer,
    }));
    setTopikSubmitMessage("");
  };

  const resetTopikQuestion = (questionNumber: number) => {
    if (!currentTopikTest) return;

    const questionKey = getTopikQuestionKey(questionNumber);
    setTopikConfirmedAnswers((prev) => {
      const next = { ...prev };
      delete next[questionKey];
      return next;
    });
    setTopikSubmitMessage("");
  };

  const calculateTopikReadingScore = (confirmedOnly = false) => {
    if (!currentTopikTest) {
      return { score: 0, total: 0, checkedTotal: 0, wrongQuestions: [] as string[] };
    }

    const answerKey = currentTopikTest.answerKey ?? {};
    const wrongQuestions: string[] = [];
    let score = 0;
    let checkedTotal = 0;

    (Object.entries(answerKey) as Array<[string, TopikReadingAnswer]>).forEach(([questionNumber, correctAnswer]) => {
      const typedQuestionNumber = Number(questionNumber);
      const selectedAnswer = confirmedOnly
        ? getTopikConfirmedAnswer(typedQuestionNumber)
        : getTopikAnswer(typedQuestionNumber);

      if (confirmedOnly && !selectedAnswer) return;

      if (selectedAnswer) checkedTotal += 1;

      if (selectedAnswer === correctAnswer) {
        score += 1;
      } else {
        wrongQuestions.push(
          `${typedQuestionNumber}. Chọn: ${formatTopikAnswer(selectedAnswer)} | Đúng: ${formatTopikAnswer(correctAnswer)}`
        );
      }
    });

    return { score, total: Object.keys(answerKey).length, checkedTotal, wrongQuestions };
  };

  const getTopikSelectedAnswerSummary = () => {
    if (!currentTopikTest) return "";

    return Array.from({ length: currentTopikTest.questionCount })
      .map((_, index) => {
        const questionNumber = index + 1;
        const confirmedAnswer = getTopikConfirmedAnswer(questionNumber);
        const selectedAnswer = getTopikAnswer(questionNumber);
        return `${questionNumber}:${selectedAnswer ?? "-"}${confirmedAnswer ? "*" : ""}`;
      })
      .join(" ");
  };

  const handleSubmitTopikReading = async () => {
    if (!currentTopikTest) return;

    if (!topikStudentName.trim()) {
      setTopikSubmitMessage("Vui lòng nhập tên học sinh trước khi lưu bài đọc TOPIK.");
      return;
    }

    const { score, total, wrongQuestions } = calculateTopikReadingScore();
    const hasAnswerKey = total > 0;
    const payload = {
      studentName: topikStudentName.trim(),
      lesson: currentTopikTest.title,
      exerciseMode: "Ôn TOPIK II - 읽기",
      score: hasAnswerKey ? score : 0,
      total: hasAnswerKey ? total : currentTopikTest.questionCount,
      wrongCount: hasAnswerKey ? wrongQuestions.length : 0,
      wrongQuestions: hasAnswerKey
        ? wrongQuestions.join("\n")
        : `Chưa có answerKey trong code. Phiếu chọn của học sinh:\n${getTopikSelectedAnswerSummary()}`,
    };

    try {
      const body = new URLSearchParams();
      body.append("payload", JSON.stringify(payload));

      await fetch(GOOGLE_SHEET_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        body,
      });

      setTopikSubmitMessage(
        hasAnswerKey
          ? `Đã nộp bài đọc TOPIK. Điểm của bạn: ${score}/${total}. Đã xác nhận ${confirmedTopikAnswerCount}/${currentTopikTest.questionCount} câu trên giao diện.`
          : "Đã lưu phiếu chọn đáp án TOPIK vào Google Sheet. Chưa chấm tự động vì trong file đề không có đáp án chính thức."
      );
    } catch (error) {
      console.error(error);
      setTopikSubmitMessage(
        hasAnswerKey
          ? `Điểm của bạn: ${score}/${total}. Nhưng chưa gửi được Google Sheet, hãy kiểm tra Apps Script URL.`
          : "Đã ghi nhận phiếu chọn trên giao diện, nhưng chưa gửi được Google Sheet. Hãy kiểm tra Apps Script URL."
      );
    }
  };


  const getYonseiBlankKey = (blankNumber: number) => {
    if (!currentYonseiLesson) return "";
    return `${currentYonseiLesson.id}-${blankNumber}`;
  };

  const normalizeYonseiAnswer = (value: string) => value.trim().replace(/\s+/g, "");

  const isYonseiBlankCorrect = (blank: YonseiBlankPart) => {
    const typed = yonseiAnswers[getYonseiBlankKey(blank.number)] ?? "";
    return normalizeYonseiAnswer(typed) === normalizeYonseiAnswer(blank.answer);
  };

  const updateYonseiAnswer = (blankNumber: number, value: string) => {
    setYonseiAnswers((prev) => ({
      ...prev,
      [getYonseiBlankKey(blankNumber)]: value,
    }));
    setYonseiChecked(false);
    setYonseiSubmitMessage("");
  };

  const calculateYonseiListeningScore = () => {
    const wrongQuestions: string[] = [];
    let score = 0;

    currentYonseiBlanks.forEach((blank) => {
      const typed = yonseiAnswers[getYonseiBlankKey(blank.number)] ?? "";

      if (normalizeYonseiAnswer(typed) === normalizeYonseiAnswer(blank.answer)) {
        score += 1;
      } else {
        wrongQuestions.push(
          `${blank.number}. Điền: ${typed || "chưa điền"} | Đúng: ${blank.answer}`
        );
      }
    });

    return { score, total: currentYonseiBlanks.length, wrongQuestions };
  };

  const handleCheckYonseiListening = () => {
    if (!isYonseiListeningReadyToCheck) {
      setYonseiSubmitMessage(
        `Hãy điền đủ ${currentYonseiBlanks.length} chỗ trống trước khi kiểm tra. Hiện tại đã điền ${filledYonseiBlankCount}/${currentYonseiBlanks.length}.`
      );
      return;
    }

    const { score, total } = calculateYonseiListeningScore();
    setYonseiChecked(true);
    setYonseiSubmitMessage(`Đã kiểm tra phần nghe. Điểm điền từ: ${score}/${total}. Tiếp theo hãy dịch toàn bộ bài sang tiếng Việt.`);
  };

  const handleSubmitYonseiListening = async () => {
    if (!currentYonseiLesson) return;

    if (!yonseiStudentName.trim()) {
      setYonseiSubmitMessage("Vui lòng nhập tên học sinh trước khi nộp bài nghe Yonsei 2.");
      return;
    }

    if (!isYonseiListeningReadyToCheck) {
      setYonseiSubmitMessage(
        `Hãy điền đủ ${currentYonseiBlanks.length} chỗ trống trước khi nộp bài. Hiện tại đã điền ${filledYonseiBlankCount}/${currentYonseiBlanks.length}.`
      );
      return;
    }

    if (!yonseiTranslation.trim()) {
      setYonseiSubmitMessage("Vui lòng dịch toàn bộ nội dung đã hoàn thành sang tiếng Việt trước khi nộp bài.");
      return;
    }

    const { score, total, wrongQuestions } = calculateYonseiListeningScore();
    const originalText = getYonseiOriginalText(currentYonseiLesson.clozeText);
    const payload = {
      studentName: yonseiStudentName.trim(),
      lesson: `${currentYonseiLesson.lessonLabel} - ${currentYonseiLesson.title} - CD ${currentYonseiLesson.cd}`,
      exerciseMode: "Luyện Nghe Yonsei 2 - Điền từ và dịch",
      score,
      total,
      wrongCount: wrongQuestions.length,
      wrongQuestions: [
        wrongQuestions.length ? wrongQuestions.join("\n") : "Không sai chỗ trống nào.",
        "",
        "Bản gốc tiếng Hàn đã hoàn thành:",
        originalText,
        "",
        "Bản dịch tiếng Việt của học sinh:",
        yonseiTranslation.trim(),
      ].join("\n"),
      translation: yonseiTranslation.trim(),
    };

    try {
      const body = new URLSearchParams();
      body.append("payload", JSON.stringify(payload));

      await fetch(GOOGLE_SHEET_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        body,
      });

      setYonseiChecked(true);
      setYonseiSubmitMessage(
        `Đã nộp bài nghe Yonsei 2. Điểm điền từ: ${score}/${total}. Bản dịch tiếng Việt đã được gửi kèm để giáo viên chấm.`
      );
    } catch (error) {
      console.error(error);
      setYonseiChecked(true);
      setYonseiSubmitMessage(
        `Điểm điền từ: ${score}/${total}. Nhưng chưa gửi được Google Sheet, hãy kiểm tra Apps Script URL.`
      );
    }
  };

  const getDreamOverlay = () => {
    if (backgroundMode === "morning") {
      return {
        background: `
          radial-gradient(circle at 50% 18%, rgba(255, 252, 214, 0.22) 0%, rgba(255, 227, 168, 0.10) 31%, transparent 58%),
          radial-gradient(circle at 18% 78%, rgba(255, 234, 82, 0.20) 0%, rgba(255, 202, 62, 0.10) 32%, transparent 62%),
          radial-gradient(circle at 82% 58%, rgba(150, 213, 255, 0.18) 0%, rgba(135, 200, 255, 0.08) 34%, transparent 62%),
          linear-gradient(180deg, rgba(120, 195, 255, 0.14) 0%, rgba(255, 235, 185, 0.08) 42%, rgba(255, 221, 75, 0.12) 74%, rgba(30, 90, 58, 0.16) 100%)
        `,
        mixBlendMode: "soft-light" as const,
      };
    }

    if (backgroundMode === "afternoon") {
      return {
        background: `
          radial-gradient(circle at 52% 18%, rgba(255, 220, 178, 0.26) 0%, rgba(255, 165, 115, 0.12) 35%, transparent 62%),
          radial-gradient(circle at 20% 76%, rgba(255, 216, 70, 0.24) 0%, rgba(255, 172, 48, 0.12) 32%, transparent 62%),
          radial-gradient(circle at 78% 54%, rgba(255, 190, 220, 0.12) 0%, rgba(125, 175, 255, 0.08) 36%, transparent 64%),
          linear-gradient(180deg, rgba(255, 168, 130, 0.15) 0%, rgba(255, 214, 145, 0.10) 45%, rgba(255, 190, 45, 0.14) 75%, rgba(82, 62, 32, 0.18) 100%)
        `,
        mixBlendMode: "soft-light" as const,
      };
    }

    return {
      background: `
        radial-gradient(circle at 50% 18%, rgba(185, 214, 255, 0.18) 0%, rgba(112, 132, 255, 0.08) 32%, transparent 62%),
        radial-gradient(circle at 18% 76%, rgba(255, 225, 95, 0.14) 0%, rgba(255, 185, 65, 0.07) 30%, transparent 60%),
        radial-gradient(circle at 80% 58%, rgba(160, 220, 255, 0.10) 0%, rgba(100, 130, 255, 0.06) 34%, transparent 64%),
        linear-gradient(180deg, rgba(8, 28, 74, 0.42) 0%, rgba(20, 45, 92, 0.24) 42%, rgba(40, 48, 54, 0.18) 72%, rgba(0, 0, 0, 0.34) 100%)
      `,
      mixBlendMode: "soft-light" as const,
    };
  };

  const getSoftGlowOverlay = () => {
    if (backgroundMode === "night") {
      return {
        background: `
          linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 38%, rgba(0,0,0,0.34) 100%),
          radial-gradient(circle at 50% 54%, transparent 0%, rgba(0, 12, 34, 0.18) 58%, rgba(0,0,0,0.40) 100%)
        `,
      };
    }

    return {
      background: `
        linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 36%, rgba(0,0,0,0.18) 100%),
        radial-gradient(circle at 50% 54%, transparent 0%, rgba(0, 20, 44, 0.08) 58%, rgba(0,0,0,0.22) 100%)
      `,
    };
  };

  const renderMeaningExercise = () => (
    <div className="mt-0 grid h-full max-h-[52vh] gap-4 overflow-y-auto pr-3 pb-8">
      {meaningQuestions.map((item, index) => {
        const key = `meaning-${index}`;
        const selected = answers[key];
        const isCorrect = selected === item.meaning;

        return (
          <div key={`${item.word}-${index}`} className="rounded-3xl border border-white/15 bg-slate-950/70 p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-2xl font-semibold text-white">
                {index + 1}. {item.word}
              </p>

              {selected && (
                <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${isCorrect ? "bg-emerald-400/25 text-emerald-100" : "bg-rose-400/25 text-rose-100"}`}>
                  {isCorrect ? "Đúng" : "Sai"}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {getMeaningOptions(item, index).map((option) => (
                <button
                  key={option}
                  disabled={Boolean(selected)}
                  onClick={() => updateAnswerOnce(key, option)}
                  className={`rounded-2xl px-5 py-4 text-left text-base font-medium transition-all ${
                    selected === option
                      ? option === item.meaning
                        ? "bg-emerald-400/25 text-white ring-2 ring-emerald-200/80"
                        : "bg-rose-400/25 text-white ring-2 ring-rose-200/80"
                      : selected
                      ? "cursor-not-allowed bg-white/[0.04] text-white/45 ring-1 ring-white/10"
                      : "bg-white/[0.08] text-white ring-1 ring-white/15 hover:scale-[1.01] hover:bg-white/[0.14]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderSentenceChoiceExercise = () => (
    <div className="mt-0 grid h-full max-h-[52vh] gap-4 overflow-y-auto pr-3 pb-8">
      {sentenceChoiceQuestions.map((question, index) => {
        const key = `sentence-${index}`;
        const selected = answers[key];
        const isCorrect = selected === question.answer;

        return (
          <div key={`${question.sentence}-${index}`} className="rounded-3xl border border-white/15 bg-slate-950/70 p-5 shadow-lg">
            <p className="mb-4 text-xl font-semibold leading-relaxed text-white">
              {index + 1}. {question.sentence}
            </p>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {question.options.map((option) => (
                <button
                  key={option}
                  disabled={Boolean(selected)}
                  onClick={() => updateAnswerOnce(key, option)}
                  className={`rounded-2xl px-5 py-4 text-base font-medium transition-all ${
                    selected === option
                      ? option === question.answer
                        ? "bg-emerald-400/25 text-white ring-2 ring-emerald-200/80"
                        : "bg-rose-400/25 text-white ring-2 ring-rose-200/80"
                      : selected
                      ? "cursor-not-allowed bg-white/[0.04] text-white/45 ring-1 ring-white/10"
                      : "bg-white/[0.08] text-white ring-1 ring-white/15 hover:scale-[1.01] hover:bg-white/[0.14]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {selected && isCorrect && (
              <div className="mt-4 rounded-2xl bg-emerald-400/20 p-4 text-base text-emerald-50">
                <p className="font-semibold">Đã chọn đúng!</p>
                <p className="mt-1">Nghĩa: {question.meaning}</p>
              </div>
            )}

            {selected && !isCorrect && (
              <p className="mt-4 rounded-2xl bg-rose-400/15 p-4 text-base text-rose-50">
                Chưa đúng. Đáp án đúng là: <span className="font-semibold">{question.answer}</span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderFillBlankExercise = () => (
    <div className="mt-0 grid h-full max-h-[52vh] gap-4 overflow-y-auto pr-3 pb-8">
      {fillBlankQuestions.map((question, index) => {
        const key = `fill-${index}`;
        const typed = answers[key] ?? "";
        const normalizedTyped = normalizeKoreanAnswer(typed);
        const isCorrect = isFillAnswerCorrect(question, typed);
        const boxCount = getFillBoxCount(question);
        const typedChars = Array.from(normalizedTyped);

        return (
          <div key={`${question.answer}-${index}`} className="rounded-3xl border border-white/15 bg-slate-950/70 p-5 shadow-lg">
            <p className="mb-3 text-xl font-semibold leading-relaxed text-white">
              {index + 1}. {question.sentenceBefore}
              <span className="mx-2 rounded-lg bg-white/15 px-10 py-1">____</span>
              {question.sentenceAfter}
            </p>

            <p className="mb-4 text-base text-white/70">Gợi ý nghĩa: {question.hint}</p>

            <label className="block">
              <span className="mb-3 block text-sm text-white/55">Nhập từ vựng tiếng Hàn vào các ô dưới đây</span>

              <div className="relative">
                <input
                  value={typed}
                  onChange={(event) => updateFillAnswer(key, event.target.value)}
                  maxLength={boxCount}
                  autoComplete="off"
                  className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
                  aria-label="Nhập từ vựng tiếng Hàn"
                />

                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: boxCount }).map((_, charIndex) => (
                    <div
                      key={charIndex}
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl font-semibold transition-all ${
                        typedChars[charIndex]
                          ? "border-white/45 bg-white/[0.12] text-white"
                          : "border-white/20 bg-white/[0.06] text-white/35"
                      }`}
                    >
                      {typedChars[charIndex] ?? ""}
                    </div>
                  ))}
                </div>
              </div>
            </label>

            {typed && isCorrect && (
              <div className="mt-4 rounded-2xl bg-emerald-400/20 p-4 text-base text-emerald-50">
                <p className="font-semibold">Đã điền đúng!</p>
                <p className="mt-1">Nghĩa: {question.meaning}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderVocabularyFooter = () => {
    const modeScore = calculateModeScore(vocabMode);
    const finalScore = calculateScore();

    if (vocabMode === "meaning") {
      return (
        <div className="mt-5 shrink-0 rounded-3xl border border-white/15 bg-slate-950/90 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-base text-white/65">Kết quả dạng 1</p>
              <p className="mt-1 text-3xl font-semibold text-white">{modeScore.score}/{modeScore.total} điểm</p>
            </div>

            {isMeaningDone ? (
              <button onClick={handleSaveMeaning} className="rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition-transform hover:scale-[1.03]">
                Lưu dạng 1 để làm tiếp dạng 2
              </button>
            ) : (
              <p className="text-base text-white/70">Hãy chọn đủ đáp án để lưu và làm tiếp dạng 2.</p>
            )}
          </div>
        </div>
      );
    }

    if (vocabMode === "sentenceChoice") {
      return (
        <div className="mt-5 shrink-0 rounded-3xl border border-white/15 bg-slate-950/90 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-base text-white/65">Kết quả dạng 2</p>
              <p className="mt-1 text-3xl font-semibold text-white">{modeScore.score}/{modeScore.total} điểm</p>
            </div>

            {isSentenceChoiceDone ? (
              <button onClick={handleSaveSentenceChoice} className="rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition-transform hover:scale-[1.03]">
                Lưu dạng 2 để làm tiếp dạng 3
              </button>
            ) : (
              <p className="text-base text-white/70">Hãy chọn đủ đáp án để lưu và làm tiếp dạng 3.</p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="mt-5 shrink-0 rounded-3xl border border-white/15 bg-slate-950/90 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-base text-white/65">Kết quả tổng 3 dạng</p>
            <p className="mt-1 text-3xl font-semibold text-white">{finalScore.score}/{finalScore.total} điểm</p>
          </div>

          {isFillBlankDone ? (
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
              <input
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                placeholder="Nhập tên học sinh"
                className="rounded-full border border-white/20 bg-white/[0.08] px-6 py-4 text-base text-white outline-none placeholder:text-white/45 focus:border-white/60"
              />

              <button onClick={handleSubmitVocabExercise} className="rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition-transform hover:scale-[1.03]">
                Nộp bài
              </button>
            </div>
          ) : (
            <p className="text-base text-white/70">Hãy điền đủ các câu ở dạng 3 để nộp bài.</p>
          )}
        </div>

        {submitMessage && (
          <p className="mt-5 rounded-2xl bg-white/[0.08] p-5 text-base leading-relaxed text-white">{submitMessage}</p>
        )}
      </div>
    );
  };


  const renderYonseiListeningModal = () => {
    if (!currentYonseiLesson) return null;

    const { score, total } = calculateYonseiListeningScore();

    return (
      <section className="fixed inset-0 z-40 flex items-center justify-center px-5 py-6">
        <div className="absolute inset-0 bg-black/35" />

        <div className="relative z-50 flex max-h-[94vh] w-full max-w-[1700px] rounded-[40px] border border-white/20 bg-slate-950/90 p-7 text-left shadow-2xl backdrop-blur-2xl">
          <aside className="mr-7 flex w-[340px] shrink-0 flex-col border-r border-white/15 pr-7">
            <p className="text-base text-white/60">Yonsei Korean Reading 2 · 듣기</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-white">Luyện Nghe Yonsei 2</h2>
            <p className="mt-5 text-base leading-relaxed text-white/65">
              Chọn bài 1-40, bật file nghe giáo viên đã upload, điền từ/cụm từ còn thiếu rồi dịch toàn bộ bài sang tiếng Việt.
            </p>

            <div className="mt-6 min-h-0 flex-1 overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-3">
                {yonseiListeningLessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setSelectedYonseiLessonId(lesson.id);
                      setSelectedLesson(lesson.lessonLabel);
                      resetYonseiListeningProgress();
                    }}
                    className={`rounded-2xl p-4 text-left transition-all duration-300 ${
                      currentYonseiLesson.id === lesson.id
                        ? "bg-white text-black"
                        : "bg-white/[0.08] text-white ring-1 ring-white/15 hover:bg-white/[0.12]"
                    }`}
                  >
                    <span className="block text-base font-semibold">Bài {lesson.lessonNumber}</span>
                    <span className="mt-1 block text-xs opacity-70">CD {lesson.cd}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/15 bg-black/35 p-5 text-sm leading-relaxed text-white/65">
              <p className="font-semibold text-white">File nghe cần upload</p>
              <p className="mt-2">
                Ưu tiên: <span className="font-semibold text-white">public/yonsei-listening-2/lesson-{String(currentYonseiLesson.lessonNumber).padStart(2, "0")}.mp3</span>
              </p>
              <p className="mt-2">Cũng hỗ trợ .m4a, .wav hoặc tên theo CD: cd-{currentYonseiLesson.cd}.mp3.</p>
            </div>

            <button
              onClick={() => {
                setSelectedExercise(null);
                resetYonseiListeningProgress();
              }}
              className="mt-6 rounded-full border border-white/20 bg-white/[0.08] px-6 py-3 text-base text-white transition-transform duration-300 hover:scale-[1.03] hover:bg-white/[0.14]"
            >
              Đóng bài nghe
            </button>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mb-5 rounded-[32px] border border-white/15 bg-black/35 p-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-base text-white/60">{currentYonseiLesson.lessonLabel} · CD {currentYonseiLesson.cd}</p>
                  <h3 className="mt-1 text-4xl font-semibold text-white">{currentYonseiLesson.title}</h3>
                  <p className="mt-2 text-lg text-white/65">
                    Đã điền {filledYonseiBlankCount}/{currentYonseiBlanks.length} chỗ trống.
                    {yonseiChecked ? ` Điểm hiện tại: ${score}/${total}.` : " Điền đủ rồi bấm kiểm tra để xem đúng/sai."}
                  </p>
                </div>

                <div className="w-full max-w-xl rounded-3xl border border-white/15 bg-white/[0.06] p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Audio</p>
                  <audio key={currentYonseiLesson.id} controls preload="metadata" className="w-full">
                    {currentYonseiLesson.audioSources.map((source) => (
                      <source key={source.src} src={source.src} type={source.type} />
                    ))}
                    Trình duyệt của bạn không hỗ trợ audio.
                  </audio>
                </div>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-hidden xl:grid-cols-[minmax(0,1fr)_430px]">
              <div className="min-h-0 overflow-y-auto rounded-[32px] border border-white/15 bg-black/35 p-6">
                <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/45">Listening cloze</p>
                    <h4 className="mt-1 text-2xl font-semibold text-white">Điền từ nghe được vào chỗ trống</h4>
                  </div>

                  <button
                    onClick={handleCheckYonseiListening}
                    className={`rounded-full px-6 py-3 text-sm font-semibold transition-transform ${
                      isYonseiListeningReadyToCheck
                        ? "bg-white text-black hover:scale-[1.03]"
                        : "cursor-not-allowed bg-white/[0.08] text-white/40"
                    }`}
                  >
                    Kiểm tra đáp án điền từ
                  </button>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 text-xl leading-[2.6] text-white">
                  {currentYonseiParts.map((part, index) => {
                    if (part.type === "text") {
                      return (
                        <span key={`text-${index}`} className="whitespace-pre-wrap text-white/82">
                          {part.text}
                        </span>
                      );
                    }

                    const key = getYonseiBlankKey(part.number);
                    const typed = yonseiAnswers[key] ?? "";
                    const correct = normalizeYonseiAnswer(typed) === normalizeYonseiAnswer(part.answer);

                    return (
                      <span key={`blank-${part.number}`} className="mx-1 inline-flex translate-y-[6px] flex-col items-center gap-1 align-baseline">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">{part.number}</span>
                        <input
                          value={typed}
                          onChange={(event) => updateYonseiAnswer(part.number, event.target.value)}
                          placeholder="..."
                          className={`w-32 rounded-xl border px-3 py-2 text-center text-base font-semibold outline-none transition-all ${
                            yonseiChecked
                              ? correct
                                ? "border-emerald-300 bg-emerald-300 text-black"
                                : "border-rose-300 bg-rose-400/20 text-rose-50"
                              : "border-white/20 bg-white/[0.10] text-white placeholder:text-white/30 focus:border-white/60"
                          }`}
                        />
                        {yonseiChecked && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${correct ? "bg-emerald-400/20 text-emerald-100" : "bg-rose-400/20 text-rose-100"}`}>
                            {correct ? "Đúng" : `Đúng: ${part.answer}`}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex min-h-0 flex-col rounded-[32px] border border-white/15 bg-black/35 p-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/45">Translation</p>
                  <h4 className="mt-1 text-2xl font-semibold text-white">Dịch toàn bộ bài sang tiếng Việt</h4>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    Sau khi điền xong chỗ trống, học sinh phải dịch toàn bộ nội dung bài nghe sang tiếng Việt. Phần dịch sẽ lưu vào Google Sheet để giáo viên chấm.
                  </p>
                </div>

                <textarea
                  value={yonseiTranslation}
                  onChange={(event) => {
                    setYonseiTranslation(event.target.value);
                    setYonseiSubmitMessage("");
                  }}
                  placeholder="Nhập bản dịch tiếng Việt đầy đủ của cả bài..."
                  className="mt-5 min-h-[260px] flex-1 resize-none rounded-3xl border border-white/15 bg-slate-950/80 p-5 text-base leading-relaxed text-white outline-none placeholder:text-white/35 focus:border-white/50"
                />

                <div className="mt-5 shrink-0 rounded-3xl border border-white/15 bg-slate-950/90 p-4">
                  <p className="text-sm text-white/60">
                    Điền từ: {filledYonseiBlankCount}/{currentYonseiBlanks.length}
                    {yonseiChecked ? ` · Đúng: ${score}/${total}` : " · Chưa kiểm tra"}
                  </p>

                  <div className="mt-3 flex flex-col gap-3">
                    <input
                      value={yonseiStudentName}
                      onChange={(event) => setYonseiStudentName(event.target.value)}
                      placeholder="Nhập tên học sinh"
                      className="rounded-full border border-white/20 bg-white/[0.08] px-5 py-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-white/60"
                    />

                    <button
                      onClick={handleSubmitYonseiListening}
                      className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
                    >
                      Nộp bài nghe và bản dịch
                    </button>
                  </div>

                  {yonseiSubmitMessage && (
                    <p className="mt-4 rounded-2xl bg-white/[0.08] p-4 text-sm leading-relaxed text-white">
                      {yonseiSubmitMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderTopikReadingModal = () => {
    if (!currentTopikTest) return null;

    const answerOptions: TopikReadingAnswer[] = ["1", "2", "3", "4"];
    const selectedScore = calculateTopikReadingScore();
    const confirmedScore = calculateTopikReadingScore(true);
    const hasAnswerKey = selectedScore.total > 0;

    return (
      <section className="fixed inset-0 z-40 flex items-center justify-center px-5 py-6">
        <div className="absolute inset-0 bg-black/35" />

        <div className="relative z-50 flex max-h-[94vh] w-full max-w-[1700px] rounded-[40px] border border-white/20 bg-slate-950/90 p-7 text-left shadow-2xl backdrop-blur-2xl">
          <aside className="mr-7 flex w-[350px] shrink-0 flex-col border-r border-white/15 pr-7">
            <p className="text-base text-white/60">TOPIK II · 읽기</p>
            <h2 className="mt-3 text-5xl font-semibold leading-tight tracking-tight text-white">Ôn TOPIK II</h2>
            <p className="mt-5 text-base leading-relaxed text-white/65">
              Chọn đề đọc, xem PDF gốc ở bên phải và làm phiếu đáp án 1-50. PDF được giữ nguyên để không sai chữ Hàn, bảng, biểu đồ và hình ảnh trong đề.
            </p>

            <div className="mt-7 flex flex-col gap-3">
              {topikReadingTests.map((test) => (
                <button
                  key={test.id}
                  onClick={() => {
                    setSelectedTopikTestId(test.id);
                    setTopikSubmitMessage("");
                  }}
                  className={`rounded-3xl p-5 text-left transition-all duration-300 ${
                    currentTopikTest.id === test.id
                      ? "bg-white text-black"
                      : "bg-white/[0.08] text-white ring-1 ring-white/15 hover:bg-white/[0.12]"
                  }`}
                >
                  <span className="block text-lg font-semibold">{test.title}</span>
                  <span className="mt-1 block text-sm opacity-70">{test.session} · {test.questionCount} câu</span>
                </button>
              ))}
            </div>

            <div className="mt-7 rounded-3xl border border-white/15 bg-black/35 p-5 text-sm leading-relaxed text-white/65">
              <p className="font-semibold text-white">File đang mở</p>
              <p className="mt-2">{currentTopikTest.sourceFileName}</p>
              <p className="mt-3">{currentTopikTest.note}</p>
            </div>

            <button
              onClick={() => {
                setSelectedExercise(null);
                resetTopikReadingProgress();
              }}
              className="mt-auto rounded-full border border-white/20 bg-white/[0.08] px-6 py-3 text-base text-white transition-transform duration-300 hover:scale-[1.03] hover:bg-white/[0.14]"
            >
              Đóng phần đọc
            </button>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mb-5 rounded-[32px] border border-white/15 bg-black/35 p-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-base text-white/60">{currentTopikTest.readingType}</p>
                  <h3 className="mt-1 text-4xl font-semibold text-white">{currentTopikTest.title}</h3>
                  <p className="mt-2 text-lg text-white/65">
                    Đã chọn {selectedTopikAnswerCount}/{currentTopikTest.questionCount} câu. Đã xác nhận {confirmedTopikAnswerCount}/{currentTopikTest.questionCount} câu.
                    {hasAnswerKey
                      ? confirmedScore.checkedTotal > 0
                        ? ` Điểm đã xác nhận: ${confirmedScore.score}/${confirmedScore.checkedTotal}.`
                        : " Chọn đáp án rồi bấm xác nhận để hiện đúng/sai ngay."
                      : " Chưa có answerKey nên phần này chỉ lưu phiếu chọn."}
                  </p>
                </div>

                <a
                  href={currentTopikTest.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/20 bg-white/[0.08] px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03] hover:bg-white/[0.14]"
                >
                  Mở PDF tab mới
                </a>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-hidden lg:grid-cols-[minmax(0,1fr)_420px]">
              <div className="min-h-0 overflow-hidden rounded-[32px] border border-white/15 bg-black/35 p-4">
                <iframe
                  src={`${currentTopikTest.pdfUrl}#toolbar=1&navpanes=0&view=FitH`}
                  title={currentTopikTest.title}
                  className="h-[70vh] w-full rounded-[24px] border-0 bg-white"
                />
              </div>

              <div className="flex min-h-0 flex-col rounded-[32px] border border-white/15 bg-black/35 p-5">
                <div className="mb-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/45">Answer sheet</p>
                  <h4 className="mt-1 text-2xl font-semibold text-white">Phiếu chọn đáp án</h4>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    Chọn ①-④ cho từng câu, sau đó bấm <span className="font-semibold text-white">Xác nhận đáp án này</span> để hệ thống hiện đúng/sai ngay.
                    {currentTopikTest.answerKeySource ? ` Nguồn đáp án: ${currentTopikTest.answerKeySource}.` : ""}
                  </p>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto pr-2">
                  <div className="grid gap-3">
                    {Array.from({ length: currentTopikTest.questionCount }).map((_, index) => {
                      const questionNumber = index + 1;
                      const selected = getTopikAnswer(questionNumber);
                      const confirmed = getTopikConfirmedAnswer(questionNumber);
                      const correct = currentTopikTest.answerKey?.[questionNumber];
                      const checked = Boolean(correct && confirmed);
                      const isCorrect = checked && confirmed === correct;

                      return (
                        <div
                          key={questionNumber}
                          className={`rounded-2xl border p-3 transition-all ${
                            checked
                              ? isCorrect
                                ? "border-emerald-400/45 bg-emerald-500/10"
                                : "border-rose-400/45 bg-rose-500/10"
                              : "border-white/10 bg-slate-950/65"
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <p className="text-sm font-semibold text-white">Câu {questionNumber}</p>
                            {checked && (
                              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isCorrect ? "bg-emerald-400/25 text-emerald-100" : "bg-rose-400/25 text-rose-100"}`}>
                                {isCorrect ? "Đúng" : "Sai"}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            {answerOptions.map((answer) => {
                              const isSelectedOption = selected === answer;
                              const isConfirmedOption = confirmed === answer;
                              const isCorrectOption = checked && correct === answer;

                              return (
                                <button
                                  key={answer}
                                  disabled={Boolean(confirmed)}
                                  onClick={() => updateTopikAnswer(questionNumber, answer)}
                                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                                    isCorrectOption
                                      ? "bg-emerald-300 text-black"
                                      : isConfirmedOption
                                      ? "bg-rose-400 text-white"
                                      : isSelectedOption
                                      ? "bg-white text-black"
                                      : confirmed
                                      ? "cursor-not-allowed bg-white/[0.05] text-white/45 ring-1 ring-white/10"
                                      : "bg-white/[0.08] text-white ring-1 ring-white/10 hover:bg-white/[0.14]"
                                  }`}
                                >
                                  {formatTopikAnswer(answer)}
                                </button>
                              );
                            })}
                          </div>

                          <div className="mt-3">
                            {!confirmed ? (
                              <div className="flex flex-col gap-2">
                                <button
                                  disabled={!selected}
                                  onClick={() => confirmTopikAnswer(questionNumber)}
                                  className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                                    selected
                                      ? "bg-white text-black hover:scale-[1.02]"
                                      : "cursor-not-allowed bg-white/[0.06] text-white/35"
                                  }`}
                                >
                                  Xác nhận đáp án này
                                </button>
                                <p className="text-xs text-white/55">
                                  {selected ? `Đã chọn ${formatTopikAnswer(selected)}. Bấm xác nhận để xem đúng/sai.` : "Chọn ①, ②, ③ hoặc ④ trước."}
                                </p>
                              </div>
                            ) : (
                              <div className="rounded-2xl bg-black/25 p-3 text-xs leading-relaxed text-white">
                                <p className={isCorrect ? "font-semibold text-emerald-100" : "font-semibold text-rose-100"}>
                                  {isCorrect
                                    ? `Chính xác. Bạn đã chọn ${formatTopikAnswer(confirmed)}.`
                                    : `Sai. Bạn chọn ${formatTopikAnswer(confirmed)}, đáp án đúng là ${formatTopikAnswer(correct)}.`}
                                </p>
                                <button
                                  onClick={() => resetTopikQuestion(questionNumber)}
                                  className="mt-2 rounded-full border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-white/75 transition hover:bg-white/[0.08]"
                                >
                                  Chọn lại
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 shrink-0 rounded-3xl border border-white/15 bg-slate-950/90 p-4">
                  <p className="text-sm text-white/60">
                    Tiến độ chọn: {selectedTopikAnswerCount}/{currentTopikTest.questionCount}
                    {hasAnswerKey
                      ? ` · Xác nhận: ${confirmedTopikAnswerCount}/${currentTopikTest.questionCount} · Đúng: ${confirmedScore.score}/${confirmedScore.checkedTotal || 0}`
                      : " · Lưu phiếu chọn"}
                  </p>

                  <div className="mt-3 flex flex-col gap-3">
                    <input
                      value={topikStudentName}
                      onChange={(event) => setTopikStudentName(event.target.value)}
                      placeholder="Nhập tên học sinh"
                      className="rounded-full border border-white/20 bg-white/[0.08] px-5 py-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-white/60"
                    />

                    <button
                      onClick={handleSubmitTopikReading}
                      className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
                    >
                      {hasAnswerKey ? "Nộp phiếu và lưu điểm" : "Lưu phiếu chọn đáp án"}
                    </button>
                  </div>

                  {topikSubmitMessage && (
                    <p className="mt-4 rounded-2xl bg-white/[0.08] p-4 text-sm leading-relaxed text-white">
                      {topikSubmitMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderVocabularyExerciseModal = () => {
    if (!currentLessonData || !selectedLevel || !selectedLesson) return null;

    return (
      <section className="fixed inset-0 z-40 flex items-center justify-center px-5 py-6">
        <div className="absolute inset-0 bg-black/35" />

        <div className="relative z-50 flex max-h-[94vh] w-full max-w-[1500px] rounded-[40px] border border-white/20 bg-slate-950/90 p-7 text-left shadow-2xl backdrop-blur-2xl">
          <aside className="mr-7 flex w-[310px] shrink-0 flex-col border-r border-white/15 pr-7">
            <p className="text-base text-white/60">
              {selectedLevel} · {selectedLesson} · {currentLessonData.topic}
            </p>

            <h2 className="mt-3 text-5xl font-semibold leading-tight tracking-tight text-white">Bài tập từ vựng</h2>

            <p className="mt-5 text-base leading-relaxed text-white/65">
              Làm lần lượt 3 dạng bài. Dạng 1 và dạng 2 chỉ được chọn đáp án một lần. Sau khi hoàn thành mỗi dạng, bấm lưu để tiếp tục.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              <button
                onClick={() => setVocabMode("meaning")}
                className={`rounded-3xl p-5 text-left transition-all duration-300 ${vocabMode === "meaning" ? "bg-white text-black" : "bg-white/[0.08] text-white ring-1 ring-white/15 hover:bg-white/[0.12]"}`}
              >
                <span className="block text-xl font-semibold">Dạng 1</span>
                <span className="mt-2 block text-base opacity-75">Chọn nghĩa đúng của từ vựng</span>
              </button>

              <button
                disabled={!savedMeaning}
                onClick={() => savedMeaning && setVocabMode("sentenceChoice")}
                className={`rounded-3xl p-5 text-left transition-all duration-300 ${
                  vocabMode === "sentenceChoice"
                    ? "bg-white text-black"
                    : savedMeaning
                    ? "bg-white/[0.08] text-white ring-1 ring-white/15 hover:bg-white/[0.12]"
                    : "cursor-not-allowed bg-white/[0.04] text-white/35 ring-1 ring-white/10"
                }`}
              >
                <span className="block text-xl font-semibold">Dạng 2</span>
                <span className="mt-2 block text-base opacity-75">Chọn từ đúng vào câu</span>
              </button>

              <button
                disabled={!savedSentenceChoice}
                onClick={() => savedSentenceChoice && setVocabMode("fillBlank")}
                className={`rounded-3xl p-5 text-left transition-all duration-300 ${
                  vocabMode === "fillBlank"
                    ? "bg-white text-black"
                    : savedSentenceChoice
                    ? "bg-white/[0.08] text-white ring-1 ring-white/15 hover:bg-white/[0.12]"
                    : "cursor-not-allowed bg-white/[0.04] text-white/35 ring-1 ring-white/10"
                }`}
              >
                <span className="block text-xl font-semibold">Dạng 3</span>
                <span className="mt-2 block text-base opacity-75">Điền từ vựng thích hợp</span>
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedExercise(null);
                resetVocabularyProgress();
              }}
              className="mt-auto rounded-full border border-white/20 bg-white/[0.08] px-6 py-3 text-base text-white transition-transform duration-300 hover:scale-[1.03] hover:bg-white/[0.14]"
            >
              Đóng bài tập
            </button>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mb-5 rounded-[32px] border border-white/15 bg-black/35 p-6">
              {vocabMode === "meaning" && (
                <>
                  <h3 className="text-4xl font-semibold text-white">Dạng 1: Chọn nghĩa đúng của từ vựng</h3>
                  <p className="mt-2 text-lg text-white/65">Gồm {meaningQuestions.length} câu hỏi. Mỗi câu đúng được 1 điểm.</p>
                </>
              )}

              {vocabMode === "sentenceChoice" && (
                <>
                  <h3 className="text-4xl font-semibold text-white">Dạng 2: Chọn từ vựng đúng vào câu tiếng Hàn</h3>
                  <p className="mt-2 text-lg text-white/65">Gồm {sentenceChoiceQuestions.length} câu hỏi. Chọn đúng sẽ hiển thị nghĩa đầy đủ của câu.</p>
                </>
              )}

              {vocabMode === "fillBlank" && (
                <>
                  <h3 className="text-4xl font-semibold text-white">Dạng 3: Điền từ vựng thích hợp vào câu mẫu</h3>
                  <p className="mt-2 text-lg text-white/65">
                    Gồm {fillBlankQuestions.length} câu hỏi. Nhập trực tiếp từ vựng tiếng Hàn để hoàn thành câu.
                    <br />
                    Chỉ cần điền đúng, kết quả sẽ được hiển thị.
                  </p>
                </>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-hidden rounded-[32px] border border-white/15 bg-black/35 p-6">
              {vocabMode === "meaning" && renderMeaningExercise()}
              {vocabMode === "sentenceChoice" && renderSentenceChoiceExercise()}
              {vocabMode === "fillBlank" && renderFillBlankExercise()}
            </div>

            {renderVocabularyFooter()}
          </div>
        </div>
      </section>
    );
  };

  return (
    <main className={`relative min-h-screen overflow-hidden bg-background text-foreground theme-${backgroundMode}`}>
      <video className="absolute inset-0 z-0 h-full w-full object-cover" src={videoUrl} autoPlay loop muted playsInline preload="auto" />

      <div className="pointer-events-none absolute inset-0 z-[1] transition-all duration-500" style={getDreamOverlay()} />

      <div className="pointer-events-none absolute inset-0 z-[2] transition-all duration-500" style={getSoftGlowOverlay()} />

      <div className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.08)_58%,rgba(0,0,0,0.20)_100%)]" />

      <nav className="relative z-20 mx-auto flex max-w-7xl flex-row items-center justify-between px-8 py-6">
        <a href="#" className="flex items-center gap-3 text-foreground">
          <img src="/kaish-logo.png" alt="KAISH logo" className="h-12 w-12 rounded-full object-cover ring-1 ring-white/40 shadow-[0_8px_28px_rgba(0,0,0,0.25)]" />
          <span className="text-4xl font-semibold tracking-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.45)]" style={{ fontFamily: "'Instrument Serif', serif" }}>
            KAISH
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a key={link} href="#" className={`text-sm transition-colors hover:text-white ${link === "Home" ? "text-white" : "text-white/65"}`}>
              {link}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <button
              onClick={() => setSettingsOpen((value) => !value)}
              className="liquid-glass flex h-11 w-11 items-center justify-center rounded-full text-lg text-white transition-transform duration-300 hover:scale-[1.05]"
              aria-label="Open settings"
            >
              ⚙
            </button>

            {settingsOpen && (
              <aside className="liquid-glass !absolute right-0 top-[calc(100%+12px)] z-50 w-[320px] rounded-3xl bg-slate-950/70 p-5 text-left shadow-2xl backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Cài đặt</h2>
                  <button onClick={() => setSettingsOpen(false)} className="rounded-full px-3 py-1 text-sm text-white/60 transition-colors hover:text-white">
                    Đóng
                  </button>
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-white">Hình nền</p>

                  <div className="grid grid-cols-3 gap-3">
                    {backgroundOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleBackgroundChange(option.id)}
                        className={`background-option background-option-${option.id} rounded-2xl p-3 text-left transition-all duration-300 hover:scale-[1.03] ${
                          backgroundMode === option.id ? "ring-2 ring-white/90" : "ring-1 ring-white/20"
                        }`}
                      >
                        <span className="block text-sm font-semibold text-white">{option.label}</span>
                        <span className="mt-1 block text-xs text-white/75">{option.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            )}
          </div>

          <button
  onClick={handleStartLearning}
  className="liquid-glass rounded-full px-6 py-2.5 text-sm text-white transition-transform duration-300 hover:scale-[1.03]"
>
  Start Learning
</button>

<button
  onClick={() => setMusicOpen((value) => !value)}
  className="liquid-glass flex items-center gap-2 rounded-full px-5 py-2.5 text-sm text-white transition-transform duration-300 hover:scale-[1.03]"
>
  <span>🎧</span>
  <span>Gamma Music</span>
</button>
        </div>
      </nav>

      <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-32 pb-40 text-center sm:py-[90px]">
        <h1 className="animate-fade-rise max-w-7xl text-5xl font-normal leading-[0.95] tracking-[-2.46px] text-white drop-shadow-[0_8px_36px_rgba(0,0,0,0.48)] sm:text-7xl md:text-8xl" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Focus <em className="not-italic text-white/72">in a distracted</em> world.
        </h1>

        <p className="animate-fade-rise-delay mt-8 max-w-3xl text-base leading-relaxed text-white/86 drop-shadow-[0_4px_22px_rgba(0,0,0,0.50)] sm:text-lg">
          깊이 있는 사고와 체계적인 학습을 위한 조용한 디지털 공간입니다.
          <br />
          자료를 정리하고, 생각을 확장하며, 더 나은 연구와 학습을 이어갑니다.
        </p>

        <button onClick={handleStartLearning} className="liquid-glass animate-fade-rise-delay-2 mt-12 cursor-pointer rounded-full px-14 py-5 text-base text-white transition-transform duration-300 hover:scale-[1.03]">
          Start Learning
        </button>

        {levelsOpen && (
          <div className="animate-fade-rise-delay-2 mt-8 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {learningLevels.map((level) => (
              <button
                key={level}
                onClick={() => handleLevelClick(level)}
                className={`liquid-glass rounded-2xl bg-slate-950/40 px-5 py-4 text-left text-sm text-white transition-all duration-300 hover:scale-[1.03] hover:bg-slate-950/55 ${
                  lessonsByLevel[level] ? "ring-1 ring-white/50" : ""
                }`}
              >
                <span className="block font-semibold">{level}</span>
                <span className="mt-1 block text-xs text-white/65">학습 단계 선택</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedLevel && (
        <section className="absolute inset-x-0 top-[160px] z-30 mx-auto w-full max-w-6xl px-6">
          <div className="relative rounded-[32px] border border-white/20 bg-slate-950/80 p-6 text-left shadow-2xl backdrop-blur-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/60">{levelKoreanName[selectedLevel] ?? selectedLevel}</p>
                <h2 className="mt-1 text-3xl font-semibold text-white">{selectedLevel} - Danh sách bài tập</h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">
                  {selectedLevelIsUnlocked
                    ? "Chọn bài học để mở các dạng bài tập."
                    : "Nhập mã giáo viên đã cung cấp trong lớp học để mở khóa cấp học này."}
                </p>
              </div>

              <button onClick={handleCloseLayer} className="rounded-full border border-white/20 bg-white/[0.08] px-4 py-2 text-sm text-white transition-transform duration-300 hover:scale-[1.03] hover:bg-white/[0.14]">
                Đóng
              </button>
            </div>

            {!selectedLevelIsUnlocked ? (
              <div className="rounded-3xl border border-white/15 bg-black/35 p-5">
                <div className="mb-4">
                  <p className="text-sm text-white/60">Mã lớp học</p>
                  <h3 className="text-2xl font-semibold text-white">
                    Nhập mã để mở khóa {selectedLevel}
                  </h3>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <input
                    value={accessCodeInput}
                    onChange={(event) => {
                      setAccessCodeInput(event.target.value);
                      setAccessMessage("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleUnlockLevel();
                    }}
                    placeholder="Nhập mã giáo viên cung cấp"
                    type="password"
                    autoComplete="off"
                    className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/[0.08] px-6 py-4 text-base text-white outline-none placeholder:text-white/45 focus:border-white/60"
                  />

                  <button
                    onClick={handleUnlockLevel}
                    className="rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition-transform hover:scale-[1.03]"
                  >
                    Mở khóa
                  </button>
                </div>

                {accessMessage && (
                  <p className="mt-4 rounded-2xl bg-rose-400/15 p-4 text-sm leading-relaxed text-rose-50">
                    {accessMessage}
                  </p>
                )}
              </div>
            ) : (
              <div className={`grid max-h-[46vh] grid-cols-2 gap-3 overflow-y-auto pr-2 sm:grid-cols-4 ${selectedLevel === YONSEI_LISTENING_LEVEL ? "lg:grid-cols-5" : ""}`}>
                {lessonsByLevel[selectedLevel].map((lesson) => {
                  const yonseiLesson =
                    selectedLevel === YONSEI_LISTENING_LEVEL
                      ? yonseiListeningLessons.find((item) => item.lessonLabel === lesson)
                      : undefined;

                  return (
                    <button
                      key={lesson}
                      onClick={() => handleLessonClick(lesson)}
                      className={`rounded-2xl border border-white/15 bg-white/[0.08] px-5 py-4 text-left text-white transition-all duration-300 hover:scale-[1.03] hover:bg-white/[0.12] ${
                        selectedLesson === lesson ? "ring-2 ring-white/80" : ""
                      }`}
                    >
                      <span className="block text-base font-semibold">{lesson}</span>
                      <span className="mt-1 block text-xs text-white/60">
                        {yonseiLesson ? `${yonseiLesson.title} · CD ${yonseiLesson.cd}` : "Bấm để chọn bài tập"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedLevelIsUnlocked && selectedLesson && (
              <div className="mt-7 rounded-3xl border border-white/15 bg-black/35 p-5">
                <div className="mb-4">
                  <p className="text-sm text-white/60">
                    {selectedLevel} · {selectedLesson}
                  </p>
                  <h3 className="text-2xl font-semibold text-white">Chọn dạng bài tập</h3>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {currentExerciseTypes.map((exercise) => (
                    <button
                      key={exercise.title}
                      className={`rounded-2xl border border-white/15 bg-white/[0.08] px-5 py-5 text-left text-white transition-all duration-300 hover:scale-[1.03] hover:bg-white/[0.12] ${
                        selectedExercise === exercise.id ? "ring-2 ring-white/80" : ""
                      }`}
                      onClick={() => handleExerciseClick(exercise.id)}
                    >
                      <span className="block text-base font-semibold">{exercise.title}</span>
                      <span className="mt-2 block text-sm leading-relaxed text-white/60">{exercise.description}</span>
                    </button>
                  ))}
                </div>
                {exerciseNotice && (
  <p className="mt-4 rounded-2xl bg-amber-400/15 p-4 text-base font-medium text-amber-50">
    {exerciseNotice}
  </p>
)}

              </div>
            )}
          </div>
        </section>
      )}
{musicOpen && (
  <div className="fixed right-6 top-24 z-[35] w-[380px] rounded-[28px] border border-white/20 bg-slate-950/85 p-4 text-left shadow-2xl backdrop-blur-2xl">
    <div className="mb-3 flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/45">
          Focus audio
        </p>
        <h3 className="mt-1 text-lg font-semibold text-white">
          Gamma Brainwave Music
        </h3>
        <p className="mt-1 text-xs text-white/55">
          Nhạc tập trung nhẹ nhàng khi làm bài
        </p>
      </div>

      <button
        onClick={() => setMusicOpen(false)}
        className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs text-white/65 transition-colors hover:bg-white/[0.12] hover:text-white"
      >
        Đóng
      </button>
    </div>

    <div className="aspect-video overflow-hidden rounded-2xl border border-white/15 bg-black/50">
      <iframe
      className="h-full w-full"
      src={`${gammaMusicEmbedUrl}?rel=0&modestbranding=1`}
      title="Gamma brainwave study music"
      referrerPolicy="strict-origin-when-cross-origin"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      />

    </div>

    <p className="mt-3 text-xs leading-relaxed text-white/45">
      Gợi ý: bật âm lượng nhỏ để giữ trạng thái tập trung ổn định.
    </p>
  </div>
)}

{selectedExercise === "vocabulary" && renderVocabularyExerciseModal()}

      {selectedExercise === "yonseiListening" && renderYonseiListeningModal()}

      {selectedExercise === "topikReading" && renderTopikReadingModal()}
    </main>
  );
}

export default App;
