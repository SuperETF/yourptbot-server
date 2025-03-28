require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(bodyParser.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

app.post('/webhook', async (req, res) => {
  const userKey = req.body.userRequest.user.id;

  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('user_key', userKey)
    .single();

  if (!member) {
    return res.json({
      version: "2.0",
      template: {
        outputs: [{ simpleText: { text: "등록된 회원이 아닙니다. 이름을 입력해주세요." } }]
      }
    });
  }

  return res.json({
    version: "2.0",
    template: {
      outputs: [{ simpleText: { text: `${member.name}님, 오늘의 식단은 닭가슴살 + 고구마입니다.` } }]
    }
  });
});

app.listen(3000, () => console.log('YourPTBot Webhook 서버 실행 중!'));
