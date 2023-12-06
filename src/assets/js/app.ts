/* eslint-disable no-use-before-define */
import confetti from 'canvas-confetti';
import Slot from '@js/Slot';
import SoundEffects from '@js/SoundEffects';

// Initialize slot machine
(() => {
  const settingsWrapper = document.getElementById('settings') as HTMLDivElement | null;
  const settingsContent = document.getElementById('settings-panel') as HTMLDivElement | null;
  const settingsSaveButton = document.getElementById('settings-save') as HTMLButtonElement | null;
  const settingsCloseButton = document.getElementById('settings-close') as HTMLButtonElement | null;
  const winnerWrapper = document.getElementById('winner') as HTMLDivElement | null;
  const winnerContent = document.getElementById('winner-panel') as HTMLDivElement | null;
  const winnerCloseButton = document.getElementById('winner-close') as HTMLButtonElement | null;
  const sunburstSvg = document.getElementById('sunburst') as HTMLImageElement | null;
  const confettiCanvas = document.getElementById('confetti-canvas') as HTMLCanvasElement | null;
  const nameListTextArea = document.getElementById('name-list') as HTMLTextAreaElement | null;
  const removeNameFromListCheckbox = document.getElementById('remove-from-list') as HTMLInputElement | null;
  const enableSoundCheckbox = document.getElementById('enable-sound') as HTMLInputElement | null;
  // const prizeNumber = document.getElementById('prize-number') as HTMLButtonElement | null;
  const prizeName = document.getElementById('prize-name') as HTMLButtonElement | null;
  const roundContainer = document.getElementById('round-container') as HTMLButtonElement | null;

  // Graceful exit if necessary elements are not found
  if (!(
    settingsWrapper
    && settingsContent
    && settingsSaveButton
    && settingsCloseButton
    && winnerWrapper
    && winnerContent
    && winnerCloseButton
    && sunburstSvg
    && confettiCanvas
    && nameListTextArea
    && removeNameFromListCheckbox
    && enableSoundCheckbox
    && prizeName
    && roundContainer
  )
  ) {
    console.error('One or more Element ID is invalid. This is possibly a bug.');
    return;
  }

  if (!(confettiCanvas instanceof HTMLCanvasElement)) {
    console.error(
      'Confetti canvas is not an instance of Canvas. This is possibly a bug.'
    );
    return;
  }

  const soundEffects = new SoundEffects();
  const MAX_REEL_ITEMS = 30;
  const CONFETTI_COLORS = [
    '#26ccff',
    '#a25afd',
    '#ff5e7e',
    '#88ff5a',
    '#fcff42',
    '#ffa62d',
    '#ff36ff'
  ];
  let confettiAnimationId;

  /** Confeetti animation instance */
  const customConfetti = confetti.create(confettiCanvas, {
    resize: true,
    useWorker: true
  });

  /** Triggers cconfeetti animation until animation is canceled */
  const confettiAnimation = () => {
    const windowWidth = window.innerWidth
      || document.documentElement.clientWidth
      || document.getElementsByTagName('body')[0].clientWidth;
    const confettiScale = Math.max(0.5, Math.min(1, windowWidth / 1100));

    customConfetti({
      particleCount: 1,
      gravity: 0.8,
      spread: 90,
      origin: { y: 0.6 },
      colors: [
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
      ],
      scalar: confettiScale
    });

    confettiAnimationId = window.requestAnimationFrame(confettiAnimation);
  };

  /** Function to stop the winning animation */
  const stopWinningAnimation = () => {
    if (confettiAnimationId) {
      window.cancelAnimationFrame(confettiAnimationId);
    }
    sunburstSvg.style.display = 'none';
  };

  /**  Function to be trigger before spinning */
  const onSpinStart = () => {
    stopWinningAnimation();
    // soundEffects.spin((MAX_REEL_ITEMS - 1) / 10);
    // prizeNumber.textContent = `Lucky Draw #${slot.currentPrizeNumber}`;
    prizeName.textContent = '';
    const imgElement = roundContainer.querySelector('img');
    if (imgElement) {
      imgElement.remove();
    }
    const lucky = document.getElementById(
      'prize-number'
    ) as HTMLDivElement | null;
    if (lucky) {
      lucky.style.display = 'block';
    }
  };

  /**  Functions to be trigger after spinning */
  const onSpinEnd = async () => {
    confettiAnimation();
    sunburstSvg.style.display = 'block';
    await soundEffects.win();
    const lucky = document.getElementById(
      'prize-number'
    ) as HTMLDivElement | null;
    if (lucky) {
      lucky.style.display = 'none';
    }
    onShowPrizeName();

    // Convert the data to a JSON string
    const winnersDataString = JSON.stringify(slot.winner);

    // Save the data to localStorage
    localStorage.setItem('winners', winnersDataString);
  };

  /** To open the winner page */
  const onShowWinnerPopup = () => {
    populateWinnerList(slot.winner);
    winnerWrapper.style.display = 'block';
  };

  /** To open the grand winner page */
  const onShowPrizeName = () => {
    // extract data to get the latest winner
    const latestRound = slot.winner[slot.winner.length - 1];

    // Get the winners array from the latest round
    const latestWinners = latestRound.winners;

    // Get the last winner from the latest winners
    const latestWinner = latestWinners[latestWinners.length - 1];

    // show prize name
    prizeName.textContent = `${latestWinner.prize}`;
    if (latestWinner.number < 11) {
      // Create a new img element for the image
      const roundImage = document.createElement('img');
      roundImage.setAttribute('src', latestWinner.img); // Set the image source
      roundImage.setAttribute(
        'alt',
        `Prize number ${slot.currentPrizeNumber + 1}`
      ); // Set the alt text
      // roundImage.style.width = '100%'; // Set the width
      roundImage.style.maxHeight = '340px'; // Set the height
      roundContainer.style.zIndex = '1'; // Set z-index
      roundContainer.appendChild(roundImage);
    }
  };

  /** To close the winner page */
  const onWinnerClose = () => {
    settingsContent.scrollTop = 0;
    winnerWrapper.style.display = 'none';
  };

  /** To show ready state */
  const onShowReady = () => {
    onSpinStart();
    const lucky = document.getElementById(
      'lucky-draw'
    ) as HTMLDivElement | null;
    if (lucky) {
      lucky.style.display = 'inline';
    }
  };

  /** Slot instance */
  const slot = new Slot({
    reelContainerSelector: '#reel',
    maxReelItems: MAX_REEL_ITEMS,
    onSpinStart,
    onSpinEnd,
    onNameListChanged: stopWinningAnimation,
    onShowWinnerPopup
  });

  /** To open the setting page */
  const onSettingsOpen = () => {
    nameListTextArea.value = slot.names.length ? slot.names.join('\n') : '';
    removeNameFromListCheckbox.checked = slot.shouldRemoveWinnerFromNameList;
    enableSoundCheckbox.checked = !soundEffects.mute;
    settingsWrapper.style.display = 'block';
  };

  /** To close the setting page */
  const onSettingsClose = () => {
    settingsContent.scrollTop = 0;
    settingsWrapper.style.display = 'none';
  };

  // Click handler for "Save" button for setting page
  settingsSaveButton.addEventListener('click', () => {
    slot.names = nameListTextArea.value
      ? nameListTextArea.value
        .split(/\n/)
        .filter((name) => Boolean(name.trim()))
      : [];
    slot.shouldRemoveWinnerFromNameList = removeNameFromListCheckbox.checked;
    soundEffects.mute = !enableSoundCheckbox.checked;
    onSettingsClose();
  });

  // Click handler for "Discard and close" button for setting page
  settingsCloseButton.addEventListener('click', onSettingsClose);

  const populateWinnerList = (winnerData) => {
    const setData = winnerData[winnerData.length - 1];

    winnerContent.innerHTML = ''; // Clear previous content
    // Iterate through rounds in the winner data
    // Create a new label element for the round
    // const setHeading = document.createElement('h2');
    // setHeading.setAttribute('for', `name-list-${setData.number}`);
    // setHeading.textContent = setData.setTitle;

    // Create a new table element
    const table = document.createElement('table');

    // Use forEach for winners array
    setData.winners.forEach((winner, winnerIndex) => {
      const row = table.insertRow();

      // Add winner.number to the first column
      const cell1 = row.insertCell(0);
      cell1.textContent = `${winner.number}`;

      // Add winner.name to the second column
      const cell2 = row.insertCell(1);
      cell2.textContent = winner.name;

      // Add winner.prize to the third column
      const cell3 = row.insertCell(2);
      cell3.textContent = winner.prize;

      // Add a class for the animation
      row.classList.add('winner-animation');

      // Calculate the animation delay
      const animationDelay = 0 * 1000 + winnerIndex * 500;

      // Set a timeout to display the animation with the calculated delay
      setTimeout(() => {
        row.classList.add('animate');
      }, animationDelay);
    });

    // Append the label and table to the winnerContent
    // winnerContent.appendChild(setHeading);
    winnerContent.appendChild(table);
  };

  // Only show at last ten prize
  const lucky = document.getElementById('lucky-draw') as HTMLDivElement | null;
  if (lucky) {
    lucky.style.display = 'none';
  }

  document.addEventListener('DOMContentLoaded', () => {
    // This function will be called when the DOM is ready

    let isInputDisabled = false;
    let isReady = false;

    const disableInputForSeconds = (milliseconds) => {
      isInputDisabled = true;
      setTimeout(() => {
        isInputDisabled = false;
      }, milliseconds);
    };

    document.addEventListener('keydown', (event) => {
      console.log('Key pressed:', event.key);
      if (event.key === ' ') {
        // Check if input is disabled
        if (isInputDisabled) {
          return; // Ignore key press if input is disabled
        }
        if (!slot.names.length) {
          onSettingsOpen();
          return;
        }
        if (slot.currentPrizeNumber === 10 && isReady === false) {
          onWinnerClose();
          onShowReady();
          isReady = true;
          return;
        }
        soundEffects.spin((MAX_REEL_ITEMS - 1) / 10);
        slot.spin(false);

        // Disable input for 3 seconds (3000 milliseconds)
        disableInputForSeconds(7000);
      }
      if (event.key === 's') {
        onSettingsOpen();
      }
      if (event.key === 'w') {
        onShowWinnerPopup();
      }
      if (event.key === 'c') {
        onWinnerClose();
        if (lucky) {
          lucky.style.display = 'block';
        }
      }
      if (event.key === 'f') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
          return;
        }
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
      if (event.key === 'p') {
        // Check if input is disabled
        if (isInputDisabled) {
          return; // Ignore key press if input is disabled
        }
        if (!slot.names.length) {
          onSettingsOpen();
          return;
        }
        if (slot.currentPrizeNumber <= 10) {
          soundEffects.spin((MAX_REEL_ITEMS - 1) / 10);
          slot.spin(true);
        }

        // Disable input for 3 seconds (3000 milliseconds)
        disableInputForSeconds(7000);
      }
    });
  });
  // login
  const urlLogin = 'http://159.89.198.242:2052/login.php?u=mlng6th&p=dec6th';
  fetch(urlLogin)
    .then((response) => response.json())
    .then((data) => {
      console.log(data, 'login'); // Handle the retrieved data here
    })
    .catch((error) => console.error('Error:', error));

  const url = 'http://159.89.198.242:2052/guest_all.php?event=mlng6th';
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data, 'GUEST FROM DB'); // Handle the retrieved data here
      // Mixed Content: The page at 'https://weddie-lucky-draw.onrender.com/' was loaded over HTTPS, but requested an insecure resource 'http://159.89.198.242:2052/login.php?u=mlng5th&p=dec5th'. This request has been blocked; the content must be served over HTTPS.
      // slot.names = data.payload;
    })
    .catch((error) => console.error('Error:', error));

  slot.names = [
    'MOHAMED SYAZWAN ABDULLAH @ LAGA',
    'JAMURI ZEN',
    'KHAIRUL ARIFFIN IDRIS',
    'SUHAILLA BINTI PEN',
    'AARON TAN CHI WU',
    'KARLOS GANING ANAK DONALD',
    'SHAHRUL NIZAM BIN JULAIHI',
    'AMY NUR SYAMIMI MOHAMMAD AZAN',
    'KHALIDA BINTI CHE RAMBLI @ BANA',
    'MOHD NOOR AZRI BIN KARIM',
    'PHILOMINA LIGHTER ',
    'RAYMOND RENTAP ENGKAMAT',
    'STEVEN HWONG LEE KIN',
    'SUFI AS-SYUHADA BINTI KADIR',
    'ABANG AZMAN BIN HUSSEIN',
    'ABANG MOHAMAD AZIZI BIN ABANG MAT ALI',
    'ABDUL HAFIZ BIN ABDUL RAHMAN',
    'ABDUL MUHAIMIN BIN YUSSUF',
    'ABDUL RAHIM BIN ABDULLAH',
    'ADIASPHIA BIN JUNAIDI',
    'ADRENCE APONG',
    'ADRIAN BUAYEH TADAM',
    'ADRIEL JAYL SELUTAN JUK',
    'AFIQ AZHAR BIN OTHMAN',
    'AHMAD BUKHARI BIN SHAMSUDDIN',
    'AHMAD HUZAIFA BIN MOHD AMING',
    'AHMAD NAJHAN BIN DERAHMAN',
    'AHMAD RAMZIE BIN RAMLE',
    'AHMAD SHAHDAN BIN HASHIM',
    'AHMAD SYAFIQ BIN RA`AID',
    'AIFAA FATIA BINTI ALI',
    'AKMAL BIN ABDULLAH',
    'AL FAKHRUL IQBAL BIN BINA',
    'ALEXANDER ANAK LABO',
    'ALEXANDER ANAK MATHEWS CHUAT',
    'ALEXEUS MENGGA ANAK BILONG',
    'ALEXIUS UGAP ANAK BELUBAU',
    'ALLISTAIR LAMBERT ANAK ANAK GINAM',
    'ALLISTAR JUAT ANAK EMBANG',
    'ALVYANA KHIEW AI MAY',
    'AMBROSE ANAK JOHN',
    'AMINOOR MOHD',
    'AMIRUL ADZHARUDIN BIN NORLEE @ BASARAN',
    'AMIRUL ARIFFIN BIN KASSIM',
    'AMRAN BIN RADUAN',
    'ANDREW LUKAS EDWARD',
    'ANDRIC FOO THAI FOOK',
    'ANDY AKUP',
    'ANDY ANAK MARIN',
    'ANDY STEPHEN',
    'ANTHONY ANAK INJAN',
    'ANYI UBIT',
    'ARAFAT BIN UJANG',
    'ARAZEIKINI BIN BRAHIM',
    "'ARIF BIN MURTADZA",
    'ASRUL BIN RAMLAN',
    'ASUN THIEN',
    'ASYRAF RABANI BIN ISMAIL',
    'ATIKAH BINTI MANSOR',
    'AUGUSTINE INYANG ANAK RAMBOK',
    "AWANG ASHA'ARI BIN AWANG BOHARI",
    'AWANG RAHIM BIN OSMAN',
    'AZAMSHAH BIN SHAHMINAN',
    'AZIZI AKRAMIN BIN BAKRI',
    'AZIZUL AMIRUDDIN BIN IJAP @ DRAHMAN',
    'AZMAN BIN MUSTAPA',
    'BALDWYN SEDIN ANAK BEKELI',
    'BARNARBY VYNER ANAK SILVESTER RAGAM',
    'BENEDICT ANAK LINGGI',
    'BENEDICT ANTHONY',
    'BENILDA ANAK JACK',
    'BENJAMIN HENRY SAOH',
    'BENJAMIN KUEH WEI BIN',
    'BENNY BELAWAN MERING',
    'BENSON WEE',
    'BIJA MENA',
    'BOEY ZHI XUAN',
    'BRIAN MAXQUINN ANAK JOSEF KOK',
    'BRYAN KALLANG KULEH',
    'BUNSU ANAK RANDI',
    'CARL LAWAI DISA',
    'CAROLL FAIZACK ANAK ISIEW',
    'CARTER BIN WILLIAM',
    'CASSIDY ANAK RABONG',
    'CHARLIE ANAK NAJOH',
    'CHONG SING CHUNG',
    'CHONG ZHIA HOWE',
    'CHRISTOPHER JOSEPH TOHA',
    'CLIFFORD JAVERIN BIN JINTEK',
    'CLLEAMON ANAK GOLEM @ NUYEH',
    'COLMAN SAYO ANAK STANLY',
    'DAISY SAOH',
    'DANIEL APOI',
    'DANIEL VICKI ANAK JAMES NINGKAN',
    'DANNY SIBAT ANAK HENRY EMPANGAU',
    'DARRELL ANAK STANLEY NORMAN GUANG',
    'DARRYL ROYSTON ANAK HARRY',
    'DAVID ANAK SAPIT',
    'DEEBRALEINA ANAK JONATHAN SAWING',
    'DELIB SHARWEN A/L KATHIRTCHELVAN',
    'DEMETRIUS ANAK ROBIN',
    'DENNIS DING EMANG',
    'DENNIS LING CHUNG YING',
    'DESMOND MAMBANG ANAK CHANGGAN',
    'DI DEE ANAK CASSIDY @ JUBIN ANAK CASSIDY',
    'DOUGLAS ANAK BANYANG',
    'DUNCAN LUA ANAK CHUWAT',
    'DUNSTAN ANAK JINGGAN',
    'DYG FARHANA FATIN BINTI AWG AFFANDI',
    'DYLAN CARTNEY ANAK PALI',
    'EDDY TAN KIM HUANG',
    'EDWIN ANAK GENING',
    'ELFIE EZYAN BIN SAPUAN',
    'ELISHA ROY ANAK MAHRAN',
    'ELVIENSY ERRIM SEMUIN',
    'ENGKAYAU ANAK BARAIN',
    'ERIC GILBERT ANAK SANGAI',
    'ERIC WONG SIEW LOONG',
    'ERNY LENORA ABDILLAH',
    'ETON ANAK AKUI',
    'FAIZUL AZRI BIN SAILI',
    'FATHULLAH HARUN BIN SAFAR-UDIN',
    'FEDRICKSON ANAK LIM',
    'FILDELIS RAYMOND ANAK GEORGE',
    'FLORINE ANAK ATAN',
    'FRANCIS ABLIGADO ANAK BUJET',
    'FRANCIS ANAK GANI',
    'FRANCIS BIN GOBEL',
    'FRANQUOIS ANAK MEKAI',
    'FREYA MAVIS ANAK BENARD RALPHIE',
    'GABRIEL SCOTT NUNOI ANAK RONEY',
    'GABRIEL TAN HONG TZUAN',
    'GABRIEL WILLIE',
    'GALLACHER EDWARD',
    'GERALD TEE KHENG SOON',
    'HAESSLER BILONG PERI',
    'HAFFIZ HILLMAN BIN MADIHI',
    'HAFIZ MOHIDIN',
    'HAGGAI ANAK TIMBAH',
    'HAMSAWI BIN SALLEH',
    'HANIF BIN HANAPI',
    'HARRIS ANAK SAIT',
    'HARRY SEKIN ANAK JABI',
    'HELLYBEN LUTAP',
    'HENDRY JUIL ANAK MASTAN',
    'HEREE BIN AHMAD',
    'HIPPOP ANAK GEMBANG',
    'HISHAM BIN HASHIM',
    'HIZBULLAH BIN HASBI',
    'HU TEY JIN',
    'ISAAC PHANG EE JIAN',
    'JAIRUS JESRIL ANAK GEDOM',
    'JAMES ANAK UNTAM',
    'JEFFERY BAKAT NANTA',
    'JEFFERY BIN SAGA',
    'JEFFRY BIN HAPANI',
    'JERRY ANAK KULLEH',
    'JIMMY ANAK NUING',
    'JOHNNY TARANTO ANAK NGALI',
    'JOSEPH B STANISLAUS MICHAEL LAITAI',
    'JULIAN BARRET ANAK BOWI',
    'JULIUS ANAK NAEL',
    'KAMARUL ARIFIN WAHAP',
    'KAMRIANA BINTI AHMAD',
    'KANG ZHUO XUAN',
    'KESUMARIANO BIN HUSSAINI',
    'KEVIN BONG KUI SOON',
    'KHAIRUL TARMIZI BIN NAWI',
    'KILO ANAK LUTAN',
    'LALU ARBI BIN ASHRI',
    'LAU CHUNG TECK',
    'LEMON ANAK DRICK',
    'LEODON CHOK ANAK LATIT',
    'LIM CHANG THIAW',
    'LING KAI SIANG',
    'LING TIEW HUI',
    'LORENZO ANAK ENGGAI',
    'LUKMAN BIN HABIBI',
    'MAC CHINEY ANAK JERRY',
    'MAHATHIR BIN IDRIS',
    'MAKOSS ANAK NABAU',
    'MARIO JANTING',
    'MARK ELISTER JALONG',
    'MAS HIDAYU BINTI MOHD EBIT',
    'MATTHEW TIE TUNG YU',
    'MATTHEW TIE TUNG YU',
    'MC ALTHUR JEKU',
    'MELLISSA SIENA ANAK KIAI',
    'MELMACELLEN ANAK MUNDED',
    'MEZALAN BIN HANAPI',
    'MOHAMAD ALLIYA AZRIEN BIN MORNI',
    'MOHAMAD ASSAD BIN ABDUL KADIR',
    'MOHAMAD AZFAR BIN ZAINURIN',
    'MOHAMAD EZZADIN BIN HENDI',
    'MOHAMAD FAIZIN BIN AHMADI',
    'MOHAMAD FAIZSAL BIN KEPLI',
    'MOHAMAD HARUN BIN DERIS',
    'MOHAMAD HISHAM BIN MOHD ALI',
    'MOHAMAD IDRIS BIN ABDUL RAHAMAN',
    'MOHAMAD IRWANDY BIN OTHMAN',
    'MOHAMAD IZRIN BIN MOHD IZNAN',
    'MOHAMAD SULAIMAN BIN MOHD RASIDI',
    'MOHAMAD SYUKRI BIN ABDUL AZID',
    'MOHAMAD TAMIZUL BIN ALI',
    'MOHAMMAD BIN OTENG',
    'MOHAMMAD FAIZAL BIN ABDULLAH',
    'MOHAMMAD HAFIDZUL IZZANI BIN ABG MANSOR',
    'MOHAMMAD HASZLAMY MADIHI',
    'MOHAMMAD KHAIRUL ANUAR BIN ABD KHALID',
    'MOHAMMAD RAZIF BIN OSMAN',
    'MOHAMMAD SAIFUL BIN ANNUAR',
    'MOHAMMAD SYUKRY BIN ABDUL RAHIM',
    'MOHAMMAD ZIKRI BIN ANNUAR',
    'MOHD ADIIB BIN AHMAD MAHMUD',
    'MOHD AMIR BIN MOHD FAIZAL',
    'MOHD AMIRI AMSYARI',
    'MOHD AZINUDDIN BIN SAHARI',
    'MOHD AZMAN BIN ISMAIL',
    'MOHD AZZRUL BIN MOHD RAMLAN',
    'MOHD FAISAL A.MUTHALIB',
    'MOHD FAIZSYHAM ZHAFYRAN BIN IBRAHIM',
    'MOHD FAZREEZ BIN ABDULLAH',
    'MOHD HISYAMUDDIN BIN ISMAIL',
    'MOHD ISWANDI BIN SHAMSUL AZMI',
    'MOHD KHADZIR BIN KHALID',
    'MOHD KHAIRIZAL BIN MOHD KHAIDZAIR',
    'MOHD KHAIRUDIN BIN ABDUL RADZAK',
    'MOHD QHADZROOL AFZAN BIN MOHD QUSHAIRI',
    'MOHD RIZWAN BIN MOHD ARIFFIN',
    'MOHD SHAHREN BIN SAUKI',
    'MOHD YUSSOF BIN AHMAD BASTAM',
    'MOHD ZUHAIRI BIN SEPO @ SEPORI',
    'MOHD. AL FARUQI BIN ZAKARIA',
    'MOHD. IZZAT BIN JAMIL',
    'MOHD. SYAFIQ BIN MOHAMAD YUSUF',
    'MUBEN ANAK SANGOG',
    'MUHAJIR BIN SYMSUL',
    "MUHAMAD ZULQARA'NAIN BIN RASHDI",
    'MUHAMMAD AFIQ BIN AFFENDY',
    'MUHAMMAD AKMAL HAKIM BIN BAHARI',
    'MUHAMMAD AQMAL BIN ZAINI',
    'MUHAMMAD FAHMI BIN ISMAIL',
    'MUHAMMAD FIKRI BIN HAMZAH',
    'MUHAMMAD HAZIQ BIN ARNI',
    'MUHAMMAD HAZIQ BIN SAZALI ABD KARIM',
    'MUHAMMAD KHAIRUL AZMAN KHOO BIN ABDULLAH',
    'MUHAMMAD ZAKI BIN MOHAMMAD SALLEH',
    'MUHD RAIS EIZZUDDIN BIN ABDULLAH',
    "MU'IZZAMIL BIN ZAMRI",
    'NADZRUL IZZUAN BIN JEPERI',
    'NAKAN ANAK JAWI',
    'NAS ISRIN BIN BUJANG',
    'NASRAFAIL BIN JOHARI',
    'NASZARI BIN ANUAR',
    'NAZARUDYN BIN MARZUKI',
    'NAZERI BIN MUNAP',
    'NAZRI BIN SAKAWI',
    'NECLOS ANAK DWARD',
    'NELLY SENGALANG',
    'NELSON ANAK NAGA',
    'NGU CHING SIONG',
    'NICHOLAS ANAK ANDREW ABAK',
    'NICLOS JAU KALLANG',
    'NIKMAN NICHLOUS NYAWAI ANAK ABDULLAH',
    'NOEL LO CHIEN YEK',
    'NOOR DAYANA M ZAIDDIE ',
    'NOR ANAK RIGIS',
    'NORAISAH BINTI ABU',
    'NORLIF BIN MOHAMED',
    'NUR MOHD NIZAM BIN SHALSAM',
    'NURAFIQZAHIN BIN HASBI',
    'NURFADZLINA BINTI DERUIS',
    'NURHASMIN BINTI HIZMI',
    'NURHAZWANI BINTI MOHD JAYA',
    'NURRUL FIRDAUS BIN AHMAD',
    'NURUL FAJRUL FAHANA BINTI SUHAILI',
    'NURULFARIZAN BINTI SON',
    'NUUR IZZUDDIN BIN JEFRIDIN',
    'NYELANG KADAM',
    'OLIVIA NYUAN ANAK MADANG',
    'PASANG ANAK TINDIN',
    'PAUL NGO BUSTAMANTE',
    'PENGIRAN BADRUL HISHAM BIN PENGIRAN MOHAMAD',
    'PHILIP BELAWING LAVONG',
    'PHILIP MASING ANAK MICHAEL JALAK',
    'PHILLIP ANAK JOHNNELSON',
    'RAFFAELLA PIAN CHEAU MEI',
    'RAFIZAN BIN ROSLAN',
    'RAHMAN BIN DRIM',
    'RAJ SHANKER SOCKALINGHAM',
    'RAMOND LIHAN',
    'RAMSON BUKIT ANAK SERUNGGAU',
    'RAYMOND CLEMENT CHEW',
    'REBITA ORAI ENGKA',
    'REYNOLD ANAK TAMBI',
    'RHANNDY ANAK JABANG',
    'RICHARD A/L RAMU',
    'RICHARD ANAK GARU',
    'RICHARDO FERNANDO',
    'RICHMOND JOE ANAK JUGAH',
    'RICKY KEBING',
    'RITCHIE FERNANDEZ AK GERGERY CHANGAT',
    'ROBERTSEL SERAI',
    'ROBINSON SERBA ANAK UTUM',
    'RODNEY BONG KUI TZE',
    'ROHANA BINTI ANIS',
    'RUDY ATA',
    'SABRI B HUSSIN',
    'SAFARI BIN SUHAIMI',
    "SAFFRI BIN SA'DAN",
    'SAMUEL NGU RONG SHAO',
    'SAVENA ANAK FABIAN',
    'SEAN ANAK LEMPIE',
    'SELIA ANAK LUIT',
    'SEPTONY EDIK',
    'SHAFIAN BIN JAPAR',
    'SHAHREEL AZWAN BIN HAMDAN',
    'SHAHRUL EIZLAN BIN ASNAN',
    'SHANE POH',
    'SHELTON ANAK STEPHEN BUDIN',
    'SIDEK BIN WAHAB',
    'SIMON ANAK NGADAN',
    'SIMON ENTALAI ANAK JANTING',
    'SITI KAMARIAH BINTI JOHARI',
    'SITI NUR AFIRA BINTI MASBA',
    'STEPHANIE ANAK DEO',
    'STRACY ANAK REDIS',
    'SUDIN AK KANA',
    'SUFIAN BIN KUSHAIRI',
    'SYED MARZIMY JAMALULLAIL BIN SYED MARZIDY',
    'SYLVESTER CHUYON ANAK MICHAEL',
    'SYLVESTER MORGAN ANAK BEN',
    'TAN FEI CHING',
    'TAN SU SANNE',
    'TANG ING YIENG',
    'TAY WEI SENG',
    'TERRANCE DILANG ANAK VINCENT UGAI',
    'TIMOTHY BIN JENNIS',
    'TIONG KWAN CHIEH',
    'TOH BES MIN',
    'VALENTINE ANAK SADIN',
    'VANESSA AK PAWIE',
    'VICTOR ANAK TINSONG',
    'VICTOR RAPHAEL KOH',
    'VICTORIA CHARLES JUTA',
    'VINCENT ANAK JIHEM',
    'VINCENT ANDY SIEH',
    'WAN AIQAL DANIAL BIN WAN ADAM',
    'WAN MOHD. ZULHEIMY BIN WAN ABU BAKAR',
    'WATHIEQ AKRAM BIN ANWAR',
    'WILSON ANAK JUNGAN',
    'WONG JINQ YUAN',
    'YOU ROU CHEOK',
    'YU YANG LONG',
    "ZAIDI B HJ MA'SOUD",
    'ZULHAZAMI BIN JOHARI',
    'ZULKIFLI BIN TURA',
    'CLARA RICKY BALA',
    'JOCELYN RURAN TAYUN',
    'SHAHRIZAL BIN EDEN',
    'HAZRINA BINTI HASNI',
    'MOHAMAD TAJUDDIN BIN PADIL@FADZIL',
    'NORIZAN BINTI HAMDAN',
    'FRANKY BUDIT OMAR',
    'SITI AISAH BINTI ALI',
    'HARRIHARAN A/L REMASH',
    'MC KAY SMITH ANAK AMBAN',
    'LING MING KAI',
    'BARRY ANAK MOGON @ EGEN',
    'CHAI SOON ENN',
    'PAUL BERAYANG SYLVESTER SALI',
    'AHMAD SOUFI BIN ISMAIL',
    'KHAIRUNNIZAM BIN AKIP',
    'ACHMED AZIZIE BIN MARZUKI',
    'CHARLIE IVAN',
    'JENNIFER SWEENY AK JOHN BUJANG',
    'MICHEAL YONG HOCK HING',
    'PETER BRUWA ANAK MINAH',
    'MUHAMMAD AFIQ ZAID BIN MOHAMED SAMSUDIN',
    'BONG YUNG FOO',
    'ALHADI AZLAN BIN ABG IBRAHIM',
    'TANG YEE FUNG',
    'MOHAMAD IBRAHIM BIN JULIS',
    'ANTONIUS ANGKOM',
    'NGU MING JIUN'
  ];
})();
