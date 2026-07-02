const router = require('express').Router();

const pilots = [
  {
    id: 1,
    name: 'George Russell',
    nameRu: 'Джордж Расселл',
    number: 63,
    nationality: 'Британия',
    flag: '🇬🇧',
    born: '1998-02-15',
    hometown: 'Кингс-Линн, Норфолк',
    bio: 'Джордж Расселл — лидер команды Mercedes-AMG Petronas F1 с 2022 года. Победитель Гран-при Бразилии 2022. Известен своей точностью в квалификации и стратегическим мышлением.',
    image: 'https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcSUl85MzIq0UtRzf6ai7DXnbN5H0Pu2WGkeoHihvdbmGJo03wpajcAFrkpwuBnbeT1PebTsGae6EAobxBcnb3KnK7u_ziuvPRioMC8Vkgc3XywZVdV_mTXUra3SjLwZDGtOR0Mx7DcWWOI&s=19',
    helmet: '#00d2be',
    stats: { races: 147, wins: 3, podiums: 18, poles: 4, championships: 0 },
    car: 'W16',
    instagram: 'georgerussell63',
    twitter: 'GeorgeRussell63',
  },
  {
    id: 2,
    name: 'Andrea Kimi Antonelli',
    nameRu: 'Андреа Ким Антонелли',
    number: 12,
    nationality: 'Италия',
    flag: '🇮🇹',
    born: '2006-08-25',
    hometown: 'Болонья, Италия',
    bio: 'Андреа Ким Антонелли — самый молодой пилот в истории Mercedes F1. Воспитанник академии Mercedes, дебютировал в 2025 году, заменив Льюиса Хэмилтона. Считается одним из самых перспективных талантов поколения.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_yh-oREORgDWuQCC3u68ErHQtOpNzBphNAKBWEpwz5w&s=10',
    helmet: '#ffffff',
    stats: { races: 10, wins: 0, podiums: 2, poles: 1, championships: 0 },
    car: 'W16',
    instagram: 'kimi_antonelli',
    twitter: 'KimiAntonelli',
  },
];

router.get('/', (req, res) => res.json(pilots));
router.get('/:id', (req, res) => {
  const pilot = pilots.find(p => p.id === Number(req.params.id));
  if (!pilot) return res.status(404).json({ error: 'Не найдено' });
  res.json(pilot);
});

module.exports = router;
