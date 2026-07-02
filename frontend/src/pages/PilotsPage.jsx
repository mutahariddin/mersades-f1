import { useState, useEffect } from 'react';
import { api } from '../api';
import { useLanguage } from '../context/LanguageContext';
import styles from './PilotsPage.module.css';

export default function PilotsPage() {
  const [pilots, setPilots] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    api.getPilots().then(setPilots).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
          <div className="spinner"/>
        </div>
      </div>
    </main>
  );

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <p className={styles.eye}>{t('pilots.season')}</p>
          <h1 className={styles.title}>{t('pilots.title')}</h1>
          <p className={styles.sub}>{t('pilots.subtitle')}</p>
        </div>

        {/* Pilots */}
        <div className={styles.pilotsGrid}>
          {pilots.map(pilot => (
            <PilotCard key={pilot.id} pilot={pilot}/>
          ))}
        </div>
      </div>
    </main>
  );
}

function PilotCard({ pilot }) {
  const [tab, setTab] = useState('bio');
  const { t, localize } = useLanguage();
  const age = new Date().getFullYear() - new Date(pilot.born).getFullYear();
  const name = localize(pilot, 'name', 'nameRu');
  const altName = name === pilot.nameRu ? pilot.name : pilot.nameRu;

  return (
    <div className={styles.card}>
      {/* Left — photo */}
      <div className={styles.photoSide}>
        <img src={pilot.image} alt={name} className={styles.photo}/>
        <div className={styles.numOverlay}>
          <span className={styles.numSign}>#</span>
          <span className={styles.num}>{pilot.number}</span>
        </div>
        <div className={styles.flagBadge}>{pilot.flag} {pilot.nationality}</div>
      </div>

      {/* Right — info */}
      <div className={styles.infoSide}>
        <div className={styles.pilotMeta}>
          <span className={styles.car}>{pilot.car}</span>
        </div>
        <h2 className={styles.pilotName}>{name}</h2>
        <p className={styles.pilotEn}>{altName}</p>

        {/* Tabs */}
        <div className={styles.tabs}>
          {['bio','stats'].map(tabKey => (
            <button key={tabKey} className={tab === tabKey ? styles.tabActive : styles.tab} onClick={() => setTab(tabKey)}>
              {tabKey === 'bio' ? t('pilots.bio') : t('pilots.stats')}
            </button>
          ))}
        </div>

        {tab === 'bio' && (
          <div className={styles.bio}>
            <p>{pilot.bio}</p>
            <div className={styles.bioMeta}>
              <span>{t('pilots.age')}: <strong>{age} {t('pilots.years')}</strong></span>
              <span>{t('pilots.city')}: <strong>{pilot.hometown}</strong></span>
            </div>
          </div>
        )}

        {tab === 'stats' && (
          <div className={styles.stats}>
            {[
              [t('pilots.stat.races'), pilot.stats.races],
              [t('pilots.stat.wins'), pilot.stats.wins],
              [t('pilots.stat.podiums'), pilot.stats.podiums],
              [t('pilots.stat.poles'), pilot.stats.poles],
              [t('pilots.stat.championships'), pilot.stats.championships],
            ].map(([label, val]) => (
              <div key={label} className={styles.stat}>
                <span className={styles.statVal}>{val}</span>
                <span className={styles.statLabel}>{label}</span>
              </div>
            ))}
          </div>
        )}

        <div className={styles.socials}>
          <a href={`https://instagram.com/${pilot.instagram}`} target="_blank" rel="noreferrer" className={styles.social}>
            Instagram
          </a>
          <a href={`https://twitter.com/${pilot.twitter}`} target="_blank" rel="noreferrer" className={styles.social}>
            Twitter / X
          </a>
        </div>
      </div>
    </div>
  );
}
