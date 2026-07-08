export interface BibleVerse {
  text: string;
  reference: string;
  topic: string;
}

export const CURATED_VERSES: BibleVerse[] = [
  {
    text: "Tudo posso naquele que me fortalece.",
    reference: "Filipenses 4:13",
    topic: "Fé e Superação"
  },
  {
    text: "O que trabalha com mão remissa empobrece, mas a mão dos diligentes enriquece.",
    reference: "Provérbios 10:4",
    topic: "Diligência e Disciplina"
  },
  {
    text: "Seja forte e corajoso! Não desanime, nem tenha medo, porque o Senhor, seu Deus, estará com você por onde você andar.",
    reference: "Josué 1:9",
    topic: "Coragem"
  },
  {
    text: "Não nos cansemos de fazer o bem, pois no tempo próprio colheremos, se não desanimarmos.",
    reference: "Gálatas 6:9",
    topic: "Perseverança"
  },
  {
    text: "O que governa o seu próprio espírito é superior ao que toma uma cidade.",
    reference: "Provérbios 16:32",
    topic: "Autocontrole e Disciplina"
  },
  {
    text: "Tudo o que fizerem, façam de todo o coração, como para o Senhor, e não para os homens.",
    reference: "Colossenses 3:23",
    topic: "Diligência"
  },
  {
    text: "Pois Deus não nos deu espírito de covardia, mas de poder, de amor e de equilíbrio.",
    reference: "2 Timóteo 1:7",
    topic: "Equilíbrio e Sabedoria"
  },
  {
    text: "A sabedoria é o objetivo do homem de entendimento, mas os olhos do tolo vagam até os confins da terra.",
    reference: "Provérbios 17:24",
    topic: "Foco"
  },
  {
    text: "Porque eu bem sei os pensamentos que tenho sobre vós, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.",
    reference: "Jeremias 29:11",
    topic: "Esperança"
  },
  {
    text: "Portanto, meus amados irmãos, mantenham-se firmes, e que nada os abale. Sejam sempre dedicados à obra do Senhor.",
    reference: "1 Coríntios 15:58",
    topic: "Firmeza"
  },
  {
    text: "Os que esperam no Senhor renovam as suas forças. Voam alto como águias; correm e não ficam exaustos, andam e não se cansam.",
    reference: "Isaías 40:31",
    topic: "Renovação"
  },
  {
    text: "A pressa colhe o desperdício, mas o planejamento paciente leva à fartura.",
    reference: "Provérbios 21:5",
    topic: "Planejamento e Paciência"
  },
  {
    text: "Recomende ao Senhor tudo o que você faz, e os seus planos darão certo.",
    reference: "Provérbios 16:3",
    topic: "Fé e Ação"
  },
  {
    text: "Combati o bom combate, acabei a carreira, guardei a fé.",
    reference: "2 Timóteo 4:7",
    topic: "Determinação"
  },
  {
    text: "Adquira a sabedoria, adquira o entendimento! Não se esqueça das minhas palavras nem delas se afaste.",
    reference: "Provérbios 4:5",
    topic: "Desenvolvimento Pessoal"
  }
];

export function getDailyVerse(): BibleVerse {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  
  const storedDate = localStorage.getItem('fm_verse_last_date');
  let storedIndexStr = localStorage.getItem('fm_verse_current_index');
  let currentIndex = 0;

  if (storedIndexStr !== null) {
    currentIndex = parseInt(storedIndexStr, 10);
  }

  // If the date is new, increment index deterministically and store
  if (storedDate !== dateStr) {
    if (storedDate !== null) {
      // Loop around when limits are reached
      currentIndex = (currentIndex + 1) % CURATED_VERSES.length;
    }
    localStorage.setItem('fm_verse_last_date', dateStr);
    localStorage.setItem('fm_verse_current_index', String(currentIndex));
  }

  return CURATED_VERSES[currentIndex];
}
