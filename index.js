require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(bodyParser.json());

// Supabase 연결
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Webhook 엔드포인트
app.post('/webhook', async (req, res) => {
  try {
    const userKey = req.body.userRequest?.user?.id;
    const message = req.body.userRequest?.utterance || "";

    console.log("🔥 카카오 요청 도착!");
    console.log("userKey:", userKey);
    console.log("message:", message);

    // Supabase에서 회원 조회
    const { data: member, error } = await supabase
      .from('members')
      .select('*')
      .eq('user_key', userKey)
      .single();

    if (error) {
      console.error("❌ Supabase 오류:", error.message);
    }

    // 회원이 등록되지 않은 경우
    if (!member) {
      return res.json({
        version: "2.0",
        template: {
          outputs: [
            {
              simpleText: {
                text: "🚫 등록된 회원 정보가 없습니다.\n이름을 입력해 주세요.",
              },
            },
          ],
        },
      });
    }

    // 사용자 발화 기반 응답 분기
    let reply = `${member.name}님, 요청하신 내용을 이해하지 못했어요 😢`;

    if (message.includes("식단")) {
      reply = `🍱 ${member.name}님, 오늘의 식단은 닭가슴살 + 고구마입니다!`;
    } else if (message.includes("운동")) {
      reply = `🏋️‍♀️ 오늘 추천 운동: 스쿼트 3세트!`;
    } else if (message.includes("예약")) {
      reply = `📆 다음 예약 가능한 시간은 오후 3시입니다. 원하시면 예약해드릴게요.`;
    } else if (message.includes("안녕") || message.includes("하이")) {
      reply = `😊 안녕하세요, ${member.name}님! 무엇을 도와드릴까요?`;
    }

    return res.json({
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: {
              text: reply,
            },
          },
        ],
      },
    });
  } catch (err) {
    console.error("서버 에러:", err);
    return res.json({
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: {
              text: "⚠️ 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
            },
          },
        ],
      },
    });
  }
});

// 서버 실행
app.listen(3000, () => {
  console.log("✅ YourPTBot Webhook 서버 실행 중! http://localhost:3000");
});
