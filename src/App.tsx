import { useEffect, useMemo, useState } from "react";

const GOOGLE_SHEET_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbxmCBs9KGkVBSb5UvqykWkA1FcH7gH_poagkKdO2btW_pTanpEpdjIL77zhtw5qpiMrJg/exec";

const videoUrl = "/videos/297736-Trim.mp4";

const navLinks = ["Home", "Studio", "About", "Journal", "Reach Us"];

type BackgroundMode = "morning" | "afternoon" | "night";
type ExerciseType = "vocabulary" | "translation" | "choice" | null;
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
];

const beginner2BLessons = [
  "Bài 8",
  "Bài 9",
  "Bài 10",
  "Bài 11",
  "Bài 12",
  "Bài 13",
  "Bài 14",
  "Bài 15",
];

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

type VocabItem = {
  word: string;
  meaning: string;
};

const lesson10Vocabulary: VocabItem[] = [
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
];

type SentenceChoiceQuestion = {
  sentence: string;
  meaning: string;
  answer: string;
  options: string[];
};

const sentenceChoiceQuestions: SentenceChoiceQuestion[] = [
  {
    sentence: "제 친구는 키가 크고 성격이 아주 ____.",
    meaning: "Bạn tôi cao và tính cách rất hoạt bát.",
    answer: "활발해요",
    options: ["활발해요", "하얀색이에요", "차요", "짧은 머리예요"],
  },
  {
    sentence: "저는 오늘 학교에 갈 때 운동화를 ____.",
    meaning: "Hôm nay khi đi đến trường, tôi mang giày thể thao.",
    answer: "신었어요",
    options: ["입었어요", "신었어요", "썼어요", "메었어요"],
  },
  {
    sentence: "날씨가 추워서 두꺼운 옷을 ____ 해요.",
    meaning: "Vì thời tiết lạnh nên phải mặc áo dày.",
    answer: "입어야",
    options: ["입어야", "벗어야", "닮아야", "차야"],
  },
  {
    sentence: "저 사람은 우리 오빠와 정말 ____.",
    meaning: "Người kia thật sự giống anh trai tôi.",
    answer: "닮았어요",
    options: ["닮았어요", "끼었어요", "보통이에요", "메었어요"],
  },
  {
    sentence: "이 가방은 ____이라서 고급스러워 보여요.",
    meaning: "Cái túi này làm bằng da nên trông sang trọng.",
    answer: "가죽",
    options: ["가죽", "선풍기", "주머니", "색깔"],
  },
  {
    sentence: "민수 씨는 요즘 ____를 해서 더 날씬해졌어요.",
    meaning: "Minsu dạo này ăn kiêng nên đã trở nên thon thả hơn.",
    answer: "다이어트",
    options: ["다이어트", "묘사", "지퍼", "열쇠고리"],
  },
  {
    sentence: "저는 여름에 ____ 옷을 자주 입어요.",
    meaning: "Vào mùa hè tôi thường mặc quần áo màu trắng.",
    answer: "하얀색",
    options: ["하얀색", "까만색", "갈색", "보라색"],
  },
  {
    sentence: "가방 ____가 고장 나서 열 수 없어요.",
    meaning: "Khóa kéo của túi bị hỏng nên không thể mở được.",
    answer: "지퍼",
    options: ["지퍼", "체격", "모습", "색깔"],
  },
  {
    sentence: "그 학생은 항상 일찍 일어나고 정말 ____.",
    meaning: "Học sinh đó luôn dậy sớm và thật sự chăm chỉ.",
    answer: "부지런해요",
    options: ["부지런해요", "통통해요", "파란색이에요", "예뻐요"],
  },
  {
    sentence: "동생은 ____라서 사람들이 자주 귀엽다고 해요.",
    meaning: "Em tôi có tóc xoăn nên mọi người thường nói là dễ thương.",
    answer: "곱슬머리",
    options: ["곱슬머리", "운동복", "열쇠고리", "선풍기"],
  },
  {
    sentence: "저는 시계를 오른손에 ____.",
    meaning: "Tôi đeo đồng hồ ở tay phải.",
    answer: "차요",
    options: ["차요", "입어요", "신어요", "메요"],
  },
  {
    sentence: "이 사람의 ____를 한국어로 묘사해 보세요.",
    meaning: "Hãy thử mô tả ngoại hình của người này bằng tiếng Hàn.",
    answer: "외모",
    options: ["외모", "주머니", "녹색", "선풍기"],
  },
];

type FillBlankQuestion = {
  sentenceBefore: string;
  sentenceAfter: string;
  meaning: string;
  answer: string;
  acceptedAnswers: string[];
  hint: string;
};

const fillBlankQuestions: FillBlankQuestion[] = [
  {
    sentenceBefore: "저는 머리가 길어서 ",
    sentenceAfter: "라고 할 수 있어요.",
    meaning: "Tôi có tóc dài nên có thể nói là tóc dài.",
    answer: "긴머리",
    acceptedAnswers: ["긴머리", "긴 머리"],
    hint: "tóc dài",
  },
  {
    sentenceBefore: "친구는 운동을 많이 해서 몸이 아주 ",
    sentenceAfter: ".",
    meaning: "Bạn tôi vận động nhiều nên dáng người rất thon thả.",
    answer: "날씬해요",
    acceptedAnswers: ["날씬해요"],
    hint: "thon thả",
  },
  {
    sentenceBefore: "이 모자는 너무 예뻐서 매일 ",
    sentenceAfter: ".",
    meaning: "Cái mũ này rất đẹp nên ngày nào tôi cũng đội.",
    answer: "씁니다",
    acceptedAnswers: ["씁니다"],
    hint: "đội / dùng",
  },
  {
    sentenceBefore: "수업이 끝나면 편한 ",
    sentenceAfter: "을/를 입고 운동해요.",
    meaning: "Sau khi tan học, tôi mặc đồ thể thao thoải mái và tập thể dục.",
    answer: "운동복",
    acceptedAnswers: ["운동복"],
    hint: "quần áo thể thao",
  },
  {
    sentenceBefore: "가방 안에 ",
    sentenceAfter: "가 있어서 열쇠를 쉽게 찾을 수 있어요.",
    meaning: "Trong túi có móc khóa nên có thể dễ dàng tìm chìa khóa.",
    answer: "열쇠고리",
    acceptedAnswers: ["열쇠고리"],
    hint: "móc khóa",
  },
  {
    sentenceBefore: "그 사람은 웃는 모습이 정말 ",
    sentenceAfter: ".",
    meaning: "Dáng vẻ khi cười của người đó thật sự đáng yêu.",
    answer: "사랑스러워요",
    acceptedAnswers: ["사랑스러워요"],
    hint: "đáng yêu",
  },
  {
    sentenceBefore: "저는 검은색보다 ",
    sentenceAfter: "을/를 더 좋아해요.",
    meaning: "Tôi thích màu xanh nước biển hơn màu đen.",
    answer: "파란색",
    acceptedAnswers: ["파란색"],
    hint: "màu xanh nước biển",
  },
  {
    sentenceBefore: "오늘은 날씨가 더워서 긴 옷을 ",
    sentenceAfter: ".",
    meaning: "Hôm nay thời tiết nóng nên tôi cởi áo dài tay ra.",
    answer: "벗어요",
    acceptedAnswers: ["벗어요"],
    hint: "cởi ra",
  },
  {
    sentenceBefore: "그 학생은 발표도 잘하고 성격도 ",
    sentenceAfter: ".",
    meaning: "Học sinh đó thuyết trình tốt và tính cách cũng hoạt bát.",
    answer: "활발해요",
    acceptedAnswers: ["활발해요"],
    hint: "hoạt bát",
  },
  {
    sentenceBefore: "바지 ",
    sentenceAfter: "에 휴대폰을 넣었어요.",
    meaning: "Tôi đã bỏ điện thoại vào túi quần.",
    answer: "주머니",
    acceptedAnswers: ["주머니"],
    hint: "túi áo / túi quần",
  },
  {
    sentenceBefore: "제 언니는 ",
    sentenceAfter: "라서 머리가 자연스럽게 곧아요.",
    meaning: "Chị tôi có tóc thẳng nên tóc tự nhiên rất thẳng.",
    answer: "생머리",
    acceptedAnswers: ["생머리"],
    hint: "tóc thẳng",
  },
  {
    sentenceBefore: "저는 손가락에 반지를 ",
    sentenceAfter: ".",
    meaning: "Tôi đeo nhẫn ở ngón tay.",
    answer: "껴요",
    acceptedAnswers: ["껴요"],
    hint: "đeo / mang nhẫn",
  },
];

function App() {
  const [backgroundMode, setBackgroundMode] =
    useState<BackgroundMode>("morning");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [levelsOpen, setLevelsOpen] = useState(false);
  const [beginner2BOpen, setBeginner2BOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>(null);
  const [vocabMode, setVocabMode] = useState<VocabMode>("meaning");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [studentName, setStudentName] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [savedMeaning, setSavedMeaning] = useState(false);
  const [savedSentenceChoice, setSavedSentenceChoice] = useState(false);

  const meaningQuestions = useMemo(() => lesson10Vocabulary.slice(0, 30), []);

  useEffect(() => {
    const savedMode = localStorage.getItem("kaish-background-mode");

    if (
      savedMode === "morning" ||
      savedMode === "afternoon" ||
      savedMode === "night"
    ) {
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

  const handleStartLearning = () => {
    setLevelsOpen((value) => !value);
    setBeginner2BOpen(false);
    setSelectedLesson(null);
    setSelectedExercise(null);
    resetVocabularyProgress();
  };

  const handleLevelClick = (level: string) => {
    if (level === "Sơ cấp 2B") {
      setBeginner2BOpen(true);
      setSelectedLesson(null);
      setSelectedExercise(null);
      resetVocabularyProgress();
      return;
    }

    alert(`${level} sẽ được xây dựng sau.`);
  };

  const handleCloseLayer = () => {
    setBeginner2BOpen(false);
    setSelectedLesson(null);
    setSelectedExercise(null);
    resetVocabularyProgress();
  };

  const handleLessonClick = (lesson: string) => {
    setSelectedLesson(lesson);
    setSelectedExercise(null);
    resetVocabularyProgress();
  };

  const handleExerciseClick = (exercise: ExerciseType) => {
    setSelectedExercise(exercise);
    resetVocabularyProgress();
  };

  const updateAnswerOnce = (key: string, value: string) => {
    setAnswers((prev) => {
      if (prev[key]) return prev;
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const updateFillAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const normalizeKoreanAnswer = (value: string) =>
    value.trim().replace(/\s+/g, "");

  const isFillAnswerCorrect = (
    question: FillBlankQuestion,
    typedAnswer: string
  ) => {
    const normalizedTyped = normalizeKoreanAnswer(typedAnswer);

    return question.acceptedAnswers.some(
      (answer) => normalizeKoreanAnswer(answer) === normalizedTyped
    );
  };

  const getFillBoxCount = (question: FillBlankQuestion) => {
    return normalizeKoreanAnswer(question.answer).length;
  };

  const getMeaningOptions = (item: VocabItem, index: number) => {
    const wrongOptions = lesson10Vocabulary
      .filter((vocab) => vocab.meaning !== item.meaning)
      .slice(index + 1, index + 4)
      .map((vocab) => vocab.meaning);

    while (wrongOptions.length < 3) {
      const fallback = lesson10Vocabulary[wrongOptions.length + 8]?.meaning;
      if (fallback && fallback !== item.meaning) wrongOptions.push(fallback);
      else wrongOptions.push("nghĩa khác");
    }

    const insertIndex = index % 4;
    const options = [...wrongOptions];
    options.splice(insertIndex, 0, item.meaning);
    return options.slice(0, 4);
  };

  const isMeaningDone = meaningQuestions.every(
    (_, index) => answers[`meaning-${index}`]
  );

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
          } | Điền: ${typed || "chưa điền"} | Đúng: ${
            question.answer
          } | Nghĩa: ${question.meaning}`
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
        if (isFillAnswerCorrect(question, typed)) {
          score += 1;
        }
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
      lesson: "Sơ cấp 2B - Bài 10",
      exerciseMode: "Bài tập từ vựng - Tổng hợp 3 dạng",
      score,
      total,
      wrongCount: wrongQuestions.length,
      wrongQuestions: wrongQuestions.join("\n"),
    };

    try {
      const body = new URLSearchParams();
      body.append("payload", JSON.stringify(payload));

      await fetch(GOOGLE_SHEET_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        body,
      });

      setSubmitMessage(
        `Đã nộp bài. Điểm của bạn: ${score}/${total}. Câu sai đã được gửi vào Google Sheet.`
      );
    } catch (error) {
      console.error(error);
      setSubmitMessage(
        `Điểm của bạn: ${score}/${total}. Nhưng chưa gửi được Google Sheet, hãy kiểm tra Apps Script URL.`
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
          <div
            key={item.word}
            className="rounded-3xl border border-white/15 bg-slate-950/70 p-5 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-2xl font-semibold text-white">
                {index + 1}. {item.word}
              </p>

              {selected && (
                <span
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                    isCorrect
                      ? "bg-emerald-400/25 text-emerald-100"
                      : "bg-rose-400/25 text-rose-100"
                  }`}
                >
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
          <div
            key={question.sentence}
            className="rounded-3xl border border-white/15 bg-slate-950/70 p-5 shadow-lg"
          >
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
                Chưa đúng. Đáp án đúng là:{" "}
                <span className="font-semibold">{question.answer}</span>
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
          <div
            key={`${question.answer}-${index}`}
            className="rounded-3xl border border-white/15 bg-slate-950/70 p-5 shadow-lg"
          >
            <p className="mb-3 text-xl font-semibold leading-relaxed text-white">
              {index + 1}. {question.sentenceBefore}
              <span className="mx-2 rounded-lg bg-white/15 px-10 py-1">
                ____
              </span>
              {question.sentenceAfter}
            </p>

            <p className="mb-4 text-base text-white/70">
              Gợi ý nghĩa: {question.hint}
            </p>

            <label className="block">
              <span className="mb-3 block text-sm text-white/55">
                Nhập từ vựng tiếng Hàn vào các ô dưới đây
              </span>

              <div className="relative">
                <input
                  value={typed}
                  onChange={(event) =>
                    updateFillAnswer(key, event.target.value)
                  }
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
              <p className="mt-1 text-3xl font-semibold text-white">
                {modeScore.score}/{modeScore.total} điểm
              </p>
            </div>

            {isMeaningDone ? (
              <button
                onClick={handleSaveMeaning}
                className="rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition-transform hover:scale-[1.03]"
              >
                Lưu dạng 1 để làm tiếp dạng 2
              </button>
            ) : (
              <p className="text-base text-white/70">
                Hãy chọn đủ đáp án để lưu và làm tiếp dạng 2.
              </p>
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
              <p className="mt-1 text-3xl font-semibold text-white">
                {modeScore.score}/{modeScore.total} điểm
              </p>
            </div>

            {isSentenceChoiceDone ? (
              <button
                onClick={handleSaveSentenceChoice}
                className="rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition-transform hover:scale-[1.03]"
              >
                Lưu dạng 2 để làm tiếp dạng 3
              </button>
            ) : (
              <p className="text-base text-white/70">
                Hãy chọn đủ đáp án để lưu và làm tiếp dạng 3.
              </p>
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
            <p className="mt-1 text-3xl font-semibold text-white">
              {finalScore.score}/{finalScore.total} điểm
            </p>
          </div>

          {isFillBlankDone ? (
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
              <input
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                placeholder="Nhập tên học sinh"
                className="rounded-full border border-white/20 bg-white/[0.08] px-6 py-4 text-base text-white outline-none placeholder:text-white/45 focus:border-white/60"
              />

              <button
                onClick={handleSubmitVocabExercise}
                className="rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition-transform hover:scale-[1.03]"
              >
                Nộp bài
              </button>
            </div>
          ) : (
            <p className="text-base text-white/70">
              Hãy điền đủ các câu ở dạng 3 để nộp bài.
            </p>
          )}
        </div>

        {submitMessage && (
          <p className="mt-5 rounded-2xl bg-white/[0.08] p-5 text-base leading-relaxed text-white">
            {submitMessage}
          </p>
        )}
      </div>
    );
  };

  const renderVocabularyExerciseModal = () => (
    <section className="fixed inset-0 z-40 flex items-center justify-center px-5 py-6">
      <div className="absolute inset-0 bg-black/35" />

      <div className="relative z-50 flex max-h-[94vh] w-full max-w-[1500px] rounded-[40px] border border-white/20 bg-slate-950/90 p-7 text-left shadow-2xl backdrop-blur-2xl">
        <aside className="mr-7 flex w-[310px] shrink-0 flex-col border-r border-white/15 pr-7">
          <p className="text-base text-white/60">Sơ cấp 2B · Bài 10 · 외모</p>

          <h2 className="mt-3 text-5xl font-semibold leading-tight tracking-tight text-white">
            Bài tập từ vựng
          </h2>

          <p className="mt-5 text-base leading-relaxed text-white/65">
            Làm lần lượt 3 dạng bài. Dạng 1 và dạng 2 chỉ được chọn đáp án một
            lần. Sau khi hoàn thành mỗi dạng, bấm lưu để tiếp tục.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            <button
              onClick={() => setVocabMode("meaning")}
              className={`rounded-3xl p-5 text-left transition-all duration-300 ${
                vocabMode === "meaning"
                  ? "bg-white text-black"
                  : "bg-white/[0.08] text-white ring-1 ring-white/15 hover:bg-white/[0.12]"
              }`}
            >
              <span className="block text-xl font-semibold">Dạng 1</span>
              <span className="mt-2 block text-base opacity-75">
                Chọn nghĩa đúng của từ vựng
              </span>
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
              <span className="mt-2 block text-base opacity-75">
                Chọn từ đúng vào câu
              </span>
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
              <span className="mt-2 block text-base opacity-75">
                Điền từ vựng thích hợp
              </span>
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
                <h3 className="text-4xl font-semibold text-white">
                  Dạng 1: Chọn nghĩa đúng của từ vựng
                </h3>
                <p className="mt-2 text-lg text-white/65">
                  Gồm 30 câu hỏi. Mỗi câu đúng được 1 điểm.
                </p>
              </>
            )}

            {vocabMode === "sentenceChoice" && (
              <>
                <h3 className="text-4xl font-semibold text-white">
                  Dạng 2: Chọn từ vựng đúng vào câu tiếng Hàn
                </h3>
                <p className="mt-2 text-lg text-white/65">
                  Chọn đúng sẽ hiển thị nghĩa đầy đủ của câu. Mỗi câu chỉ được
                  chọn một lần.
                </p>
              </>
            )}

            {vocabMode === "fillBlank" && (
              <>
                <h3 className="text-4xl font-semibold text-white">
                  Dạng 3: Điền từ vựng thích hợp vào câu mẫu
                </h3>
                <p className="mt-2 text-lg text-white/65">
                  Nhập trực tiếp từ vựng tiếng Hàn để hoàn thành câu.
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

  return (
    <main
      className={`relative min-h-screen overflow-hidden bg-background text-foreground theme-${backgroundMode}`}
    >
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />

      <div
        className="pointer-events-none absolute inset-0 z-[1] transition-all duration-500"
        style={getDreamOverlay()}
      />

      <div
        className="pointer-events-none absolute inset-0 z-[2] transition-all duration-500"
        style={getSoftGlowOverlay()}
      />

      <div className="pointer-events-none absolute inset-0 z-[3] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.08)_58%,rgba(0,0,0,0.20)_100%)]" />

      <nav className="relative z-20 mx-auto flex max-w-7xl flex-row items-center justify-between px-8 py-6">
        <a href="#" className="flex items-center gap-3 text-foreground">
          <img
            src="/kaish-logo.png"
            alt="KAISH logo"
            className="h-12 w-12 rounded-full object-cover ring-1 ring-white/40 shadow-[0_8px_28px_rgba(0,0,0,0.25)]"
          />
          <span
            className="text-4xl font-semibold tracking-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.45)]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            KAISH
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className={`text-sm transition-colors hover:text-white ${
                link === "Home" ? "text-white" : "text-white/65"
              }`}
            >
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
                  <button
                    onClick={() => setSettingsOpen(false)}
                    className="rounded-full px-3 py-1 text-sm text-white/60 transition-colors hover:text-white"
                  >
                    Đóng
                  </button>
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-white">
                    Hình nền
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    {backgroundOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleBackgroundChange(option.id)}
                        className={`background-option background-option-${option.id} rounded-2xl p-3 text-left transition-all duration-300 hover:scale-[1.03] ${
                          backgroundMode === option.id
                            ? "ring-2 ring-white/90"
                            : "ring-1 ring-white/20"
                        }`}
                      >
                        <span className="block text-sm font-semibold text-white">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-xs text-white/75">
                          {option.description}
                        </span>
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
        </div>
      </nav>

      <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-32 pb-40 text-center sm:py-[90px]">
        <h1
          className="animate-fade-rise max-w-7xl text-5xl font-normal leading-[0.95] tracking-[-2.46px] text-white drop-shadow-[0_8px_36px_rgba(0,0,0,0.48)] sm:text-7xl md:text-8xl"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Focus{" "}
          <em className="not-italic text-white/72">in a distracted</em>{" "}
          world.
        </h1>

        <p className="animate-fade-rise-delay mt-8 max-w-3xl text-base leading-relaxed text-white/86 drop-shadow-[0_4px_22px_rgba(0,0,0,0.50)] sm:text-lg">
          깊이 있는 사고와 체계적인 학습을 위한 조용한 디지털 공간입니다.
          <br />
          자료를 정리하고, 생각을 확장하며, 더 나은 연구와 학습을
          이어갑니다.
        </p>

        <button
          onClick={handleStartLearning}
          className="liquid-glass animate-fade-rise-delay-2 mt-12 cursor-pointer rounded-full px-14 py-5 text-base text-white transition-transform duration-300 hover:scale-[1.03]"
        >
          Start Learning
        </button>

        {levelsOpen && (
          <div className="animate-fade-rise-delay-2 mt-8 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {learningLevels.map((level) => (
              <button
                key={level}
                onClick={() => handleLevelClick(level)}
                className={`liquid-glass rounded-2xl bg-slate-950/40 px-5 py-4 text-left text-sm text-white transition-all duration-300 hover:scale-[1.03] hover:bg-slate-950/55 ${
                  level === "Sơ cấp 2B" ? "ring-1 ring-white/50" : ""
                }`}
              >
                <span className="block font-semibold">{level}</span>
                <span className="mt-1 block text-xs text-white/65">
                  학습 단계 선택
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {beginner2BOpen && (
        <section className="absolute inset-x-0 top-[160px] z-30 mx-auto w-full max-w-6xl px-6">
          <div className="relative rounded-[32px] border border-white/20 bg-slate-950/80 p-6 text-left shadow-2xl backdrop-blur-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/60">초급 2B</p>
                <h2 className="mt-1 text-3xl font-semibold text-white">
                  Sơ cấp 2B - Danh sách bài tập
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">
                  Chọn bài học để mở các dạng bài tập.
                </p>
              </div>

              <button
                onClick={handleCloseLayer}
                className="rounded-full border border-white/20 bg-white/[0.08] px-4 py-2 text-sm text-white transition-transform duration-300 hover:scale-[1.03] hover:bg-white/[0.14]"
              >
                Đóng
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {beginner2BLessons.map((lesson) => (
                <button
                  key={lesson}
                  onClick={() => handleLessonClick(lesson)}
                  className={`rounded-2xl border border-white/15 bg-white/[0.08] px-5 py-4 text-left text-white transition-all duration-300 hover:scale-[1.03] hover:bg-white/[0.12] ${
                    selectedLesson === lesson ? "ring-2 ring-white/80" : ""
                  }`}
                >
                  <span className="block text-base font-semibold">
                    {lesson}
                  </span>
                  <span className="mt-1 block text-xs text-white/60">
                    Bấm để chọn bài tập
                  </span>
                </button>
              ))}
            </div>

            {selectedLesson && (
              <div className="mt-7 rounded-3xl border border-white/15 bg-black/35 p-5">
                <div className="mb-4">
                  <p className="text-sm text-white/60">{selectedLesson}</p>
                  <h3 className="text-2xl font-semibold text-white">
                    Chọn dạng bài tập
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {exerciseTypes.map((exercise) => (
                    <button
                      key={exercise.title}
                      className={`rounded-2xl border border-white/15 bg-white/[0.08] px-5 py-5 text-left text-white transition-all duration-300 hover:scale-[1.03] hover:bg-white/[0.12] ${
                        selectedExercise === exercise.id
                          ? "ring-2 ring-white/80"
                          : ""
                      }`}
                      onClick={() => handleExerciseClick(exercise.id)}
                    >
                      <span className="block text-base font-semibold">
                        {exercise.title}
                      </span>
                      <span className="mt-2 block text-sm leading-relaxed text-white/60">
                        {exercise.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {selectedLesson === "Bài 10" &&
        selectedExercise === "vocabulary" &&
        renderVocabularyExerciseModal()}
    </main>
  );
}

export default App;