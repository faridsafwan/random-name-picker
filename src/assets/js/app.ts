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
    'AMIR HAMZAH GHAZALI',
    'JAMURI ZEN',
    'KHAIRUL ARIFFIN IDRIS',
    'NUR AYUNI PUSTABEL',
    'AARON TAN CHI WU',
    'ELIZABETH CLAINEY ANAK AMBROSE JEMUT',
    'KARLOS GANING ANAK DONALD',
    'SHAHRUL NIZAM BIN JULAIHI',
    'MOHD NOOR AZRI BIN KARIM',
    'PHILOMINA LIGHTER ',
    'RAYMOND RENTAP ENGKAMAT',
    'SHAWN THOMAS',
    'STEVEN HWONG LEE KIN',
    'SUFI AS-SYUHADA BINTI KADIR',
    'ABANG AZMAN BIN HUSSEIN',
    'ABANG MOHAMAD AZIZI BIN ABANG MAT ALI',
    'ABDUL FARRIF BIN ABDUL HAMMID',
    'ABDUL HAFIZ BIN ABDUL RAHMAN',
    'ABDUL MALIK BIN BOLHI',
    'ABDUL MUHAIMIN BIN YUSSUF',
    'ABDUL RAHIM BIN ABDULLAH',
    'ABDULLAH BIN ISMAIL',
    'ADIASPHIA BIN JUNAIDI',
    'ADIB HASBULLAH BIN RUDUAN',
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
    'AIDAA AFILAH BINTI ABDULLAH',
    'AIFAA FATIA BINTI ALI',
    'AKHBAR BIN MOHAMED @ MUHAMAD',
    'AKMAL BIN ABDULLAH',
    'AL FAKHRUL IQBAL BIN BINA',
    'ALBUIN ANAK PHILIP JAGAK',
    'ALEXANDER ANAK LABO',
    'ALEXANDER ANAK MATHEWS CHUAT',
    'ALEXANDER MARAN ANAK JELANI',
    'ALEXEUS MENGGA ANAK BILONG',
    'ALEXIUS UGAP ANAK BELUBAU',
    'ALLISTAIR LAMBERT ANAK ANAK GINAM',
    'ALLISTAR JUAT ANAK EMBANG',
    'ALVYANA KHIEW AI MAY',
    'AMBROSE ANAK JOHN',
    'AMEER SAIFULLAH ABDULLAH',
    'AMINOOR MOHD',
    'AMIRUL ADZHARUDIN BIN NORLEE @ BASARAN',
    'AMIRUL ARIFFIN BIN KASSIM',
    'AMRAN BIN RADUAN',
    'ANDREW LUKAS EDWARD',
    'ANDRIC FOO THAI FOOK',
    'ANDY AKUP',
    'ANDY ANAK MARIN',
    'ANDY STEPHEN',
    'ANISAH BINTI ABDUL SAMAH',
    'ANTHONY ANAK INJAN',
    'ANYI UBIT',
    'ARAFAT BIN UJANG',
    'ARAZEIKINI BIN BRAHIM',
    "'ARIF BIN MURTADZA",
    'ARIFFIN BIN SHARKAWI',
    'ASRUL BIN RAMLAN',
    'ASUN THIEN',
    'ASYRAF RABANI BIN ISMAIL',
    'ATHEA BINTI WAHED',
    'ATIKAH BINTI MANSOR',
    'AUGUSTINE INYANG ANAK RAMBOK',
    "AWANG ASHA'ARI BIN AWANG BOHARI",
    'AWANG RAHIM BIN OSMAN',
    'AWANGKU AHMAD RITHAUDDIN BIN AWANG ZIAN',
    'AZAMSHAH BIN SHAHMINAN',
    'AZIEZANNIE AZIRA BIN ABANG IBRAHIM',
    'AZIZI AKRAMIN BIN BAKRI',
    'AZIZI BIN AZIZAN KHAMAT',
    'AZIZUL AMIRUDDIN BIN IJAP @ DRAHMAN',
    'AZMAN BIN MUSTAPA',
    'AZMAN HUSUN',
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
    'BRYAN ANAK SIMON TITIK',
    'BRYAN KALLANG KULEH',
    'BUDI MULYADI BIN ABDUL RAHMAN',
    'BUNSU ANAK RANDI',
    'CARL LAWAI DISA',
    'CARLOUISE ANAK SANGAI',
    'CAROLL FAIZACK ANAK ISIEW',
    'CARTER BIN WILLIAM',
    'CASSIDY ANAK RABONG',
    'CHAN WEI SIANG',
    'CHARLIE ANAK NAJOH',
    'CHONG SING CHUNG',
    'CHONG ZHIA HOWE',
    'CHRISTOPHER JOSEPH TOHA',
    'CLARENCE ANAK CHUNDANG',
    'CLIFFORD JAVERIN BIN JINTEK',
    'CLLEAMON ANAK GOLEM @ NUYEH',
    'COLMAN SAYO ANAK STANLY',
    'DAISY SAOH',
    'DANIAL SA-ED@SAED',
    'DANIEL APOI',
    'DANIEL VICKI ANAK JAMES NINGKAN',
    'DANNY SIBAT ANAK HENRY EMPANGAU',
    'DARRELL ANAK STANLEY NORMAN GUANG',
    'DARRYL ROYSTON ANAK HARRY',
    'DAVID ANAK SAPIT',
    "DAYANG NUR'IRMA FARAHAIN BINTI ABANG PATDELI",
    'DEEBRALEINA ANAK JONATHAN SAWING',
    'DELIB SHARWEN A/L KATHIRTCHELVAN',
    'DEMETRIUS ANAK ROBIN',
    'DENNIS DING EMANG',
    'DENNIS LING CHUNG YING',
    'DESMOND GOH KAI HONG',
    'DESMOND MAMBANG ANAK CHANGGAN',
    'DI DEE ANAK CASSIDY @ JUBIN ANAK CASSIDY',
    'DOUGLAS ANAK BANYANG',
    'DUNCAN LUA ANAK CHUWAT',
    'DUNSTAN ANAK JINGGAN',
    'DYG FARHANA FATIN BINTI AWG AFFANDI',
    'DYLAN CARTNEY ANAK PALI',
    'EDDY TAN KIM HUANG',
    'EDWIN ANAK GENING',
    'EILEEN LIAW CHUEN ING',
    'ELFIE EZYAN BIN SAPUAN',
    'ELISHA ROY ANAK MAHRAN',
    'ELVIENSY ERRIM SEMUIN',
    'ENGKAYAU ANAK BARAIN',
    'ERIC GILBERT ANAK SANGAI',
    'ERIC WONG SIEW LOONG',
    'ERNY LENORA ABDILLAH',
    'ERRY SYAIFULRIDZMAN BIN BODI',
    'ETON ANAK AKUI',
    'FAHMI BIN ALI',
    'FAIZUL AZRI BIN SAILI',
    'FARAH BINTI ESRAN',
    'FARRAH NAJWA BINTI AMAT ZAIDEL',
    'FARZANA BINTI YURAIMAN',
    'FATHULLAH HARUN BIN SAFAR-UDIN',
    'FAUZI BIN BUJANG WALI-EE',
    'FEDRICKSON ANAK LIM',
    'FILDELIS RAYMOND ANAK GEORGE',
    'FLORINE ANAK ATAN',
    'FRANCIS ABLIGADO ANAK BUJET',
    'FRANCIS ANAK GANI',
    'FRANCIS BIN GOBEL',
    'FRANQUOIS ANAK MEKAI',
    'FREDDY ANAK BEKARANG',
    'FREDELLIN TEGARAN ANAK FREDERICK JIMBAI',
    'FREYA MAVIS ANAK BENARD RALPHIE',
    'GABRIEL SCOTT NUNOI ANAK RONEY',
    'GABRIEL TAN HONG TZUAN',
    'GABRIEL WILLIE',
    'GALLACHER EDWARD',
    'GERALD TEE KHENG SOON',
    'GOH YU CHEN',
    'HAESSLER BILONG PERI',
    'HAFFIZ HILLMAN BIN MADIHI',
    'HAFIZ MOHIDIN',
    'HAGGAI ANAK TIMBAH',
    'HAIZAM SHAH BIN HAMID SHAH',
    'HAMSAWI BIN SALLEH',
    'HANIF BIN HANAPI',
    'HARIFFIN ARIF BIN KHAIRUDDIN @ JINAT',
    'HARRIS ANAK SAIT',
    'HARRY SEKIN ANAK JABI',
    'HAZIMIN BIN SAHMAT',
    "HAZ'ZAID BIN ABDUL MU'IN",
    'HELLYBEN LUTAP',
    'HENDRY JUIL ANAK MASTAN',
    'HEREE BIN AHMAD',
    'HERMAN BIN ARSHAD',
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
    'JEROME EMMANUEL ANAK JAMES SIDEK',
    'JERRY ANAK KULLEH',
    'JICKSON JAICE ANAK BIDAT',
    'JIMMY ANAK MUNANG',
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
    'KHAIRUL BUDIMAN BIN SAUDI',
    'KHAIRUL FATHURRAHMAN BIN MAZELAN',
    'KHAIRUL NIZAM BIN ARIFIN',
    'KHAIRUL TARMIZI BIN NAWI',
    'KHAIRUNNISA HANISAH BINTI NURUDDIN',
    'KILO ANAK LUTAN',
    'LALU ARBI BIN ASHRI',
    'LANCASTER ANAK SIMON',
    'LARRY ALBERT JALAK',
    'LATA ANAK LANDA',
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
    'MAHBAR BIN SANAWI',
    'MAJIDI BIN JALIS',
    'MAKOSS ANAK NABAU',
    'MARIO JANTING',
    'MARK ELISTER JALONG',
    'MARY LING SIEW ENG',
    'MAS HIDAYU BINTI MOHD EBIT',
    'MATTHEW TIE TUNG YU',
    'MATTHEW TIE TUNG YU',
    'MC ALTHUR JEKU',
    'MELLISSA SIENA ANAK KIAI',
    'MELMACELLEN ANAK MUNDED',
    'MEZALAN BIN HANAPI',
    'MOHAMAD ALLIYA AZRIEN BIN MORNI',
    'MOHAMAD ASFIA BIN KENIL',
    'MOHAMAD ASSAD BIN ABDUL KADIR',
    'MOHAMAD AZFAR BIN ZAINURIN',
    'MOHAMAD AZROY BIN ALI',
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
    'MOHAMAD ZAIN BIN JOHARI',
    'MOHAMMAD BIN OTENG',
    'MOHAMMAD FAIZAL BIN ABDULLAH',
    'MOHAMMAD HAFIDZUL IZZANI BIN ABG MANSOR',
    'MOHAMMAD HASZLAMY MADIHI',
    'MOHAMMAD KHAIRUL ANUAR BIN ABD KHALID',
    'MOHAMMAD KUSHAIRI BIN MOHIDEN',
    'MOHAMMAD RAFIQUDDIN BIN ALADDIN',
    'MOHAMMAD RAZIF BIN OSMAN',
    'MOHAMMAD SAIFUL BIN ANNUAR',
    'MOHAMMAD SYUKRY BIN ABDUL RAHIM',
    'MOHAMMAD ZIKRI BIN ANNUAR',
    'MOHD ADIIB BIN AHMAD MAHMUD',
    'MOHD AMIR BIN MOHD FAIZAL',
    'MOHD AMIRI AMSYARI',
    'MOHD AZINUDDIN BIN SAHARI',
    'MOHD AZIZAN BIN MORNI',
    'MOHD AZLAN BIN ONN',
    'MOHD AZMAN BIN ISMAIL',
    'MOHD AZZRUL BIN MOHD RAMLAN',
    'MOHD EZZUDDIN BIN ZAKARIA',
    'MOHD FAISAL A.MUTHALIB',
    'MOHD FAIZSYHAM ZHAFYRAN BIN IBRAHIM',
    'MOHD FAZREEZ BIN ABDULLAH',
    'MOHD HAFIQ BIN ABDUL MALEK ALCAFF',
    'MOHD HELMI BIN SAHMAT',
    'MOHD HISYAMUDDIN BIN ISMAIL',
    'MOHD ISWANDI BIN SHAMSUL AZMI',
    'MOHD KHADZIR BIN KHALID',
    'MOHD KHAIRIZAL BIN MOHD KHAIDZAIR',
    'MOHD KHAIRUDIN BIN ABDUL RADZAK',
    'MOHD QHADZROOL AFZAN BIN MOHD QUSHAIRI',
    'MOHD RIZWAN BIN MOHD ARIFFIN',
    'MOHD SHAHIR BIN OSMAN',
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
    "MUHAMMAD 'AQIB AMINI BIN MD GHAZALI",
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
    'NASIRUDDIN BIN AHMAD',
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
    'NORAZWAN BIN FADZIL',
    'NORLIDA PIEE',
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
    'OLIVIA BINTI HASSAN',
    'OLIVIA NYUAN ANAK MADANG',
    'PASANG ANAK TINDIN',
    'PAUL NGO BUSTAMANTE',
    'PENGIRAN BADRUL HISHAM BIN PENGIRAN MOHAMAD',
    'PHILIP BELAWING LAVONG',
    'PHILIP MASING ANAK MICHAEL JALAK',
    'PHILLIP ANAK JOHNNELSON',
    "RABI'ATUL ADAWIYAH BINTI ABU BAKAR",
    'RAFFAELLA PIAN CHEAU MEI',
    'RAFIZAN BIN ROSLAN',
    'RAHMAN BIN DRIM',
    'RAJ SHANKER SOCKALINGHAM',
    'RALI BIN SEBLI',
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
    'RITCHIE FERNANDEZ ANAK JIHEN',
    'ROBERT ANAK SUAT',
    'ROBERTSEL SERAI',
    'ROBINSON SERBA ANAK UTUM',
    'RODNEY BONG KUI TZE',
    'ROHANA BINTI ANIS',
    'ROSE SAPINAH BINTI HASHIM',
    'RUDY ATA',
    'RURAN PAUL',
    'SABRI B HUSSIN',
    'SAFARI BIN SUHAIMI',
    "SAFFRI BIN SA'DAN",
    'SAFRI BIN SALIHIN',
    'SAMUEL NGU RONG SHAO',
    'SAPINAH BAKAWI',
    'SAVENA ANAK FABIAN',
    'SEAN ANAK LEMPIE',
    'SELIA ANAK LUIT',
    'SEPTONY EDIK',
    'SHAFIAN BIN JAPAR',
    'SHAHREEL AZWAN BIN HAMDAN',
    'SHAHRILNIKMAN BIN MOHAMAD',
    'SHAHRUL EIZLAN BIN ASNAN',
    'SHANE POH',
    'SHELTON ANAK STEPHEN BUDIN',
    'SIDEK BIN WAHAB',
    'SIMON ANAK NGADAN',
    'SIMON ENTALAI ANAK JANTING',
    'SITI KAMARIAH BINTI JOHARI',
    'SITI NUR AFIRA BINTI MASBA',
    'SITINORSIAH BINTI HASBEE',
    'STEPHANIE ANAK DEO',
    'STEVEN ANAK HENRY',
    'STRACY ANAK REDIS',
    'SUDIN AK KANA',
    'SUFIAN BIN KUSHAIRI',
    'SULAIMAN BIN USOP',
    'SYAMSUL BAKHRI BIN BOHARI',
    'SYED MARZIMY JAMALULLAIL BIN SYED MARZIDY',
    'SYLVESTER CHUYON ANAK MICHAEL',
    'SYLVESTER MORGAN ANAK BEN',
    'SYUKRI ZAKARIA BIN ENCHE ABDUL RAHMAN',
    'TAN FEI CHING',
    'TAN SU SANNE',
    'TANG ING YIENG',
    'TAY WEI SENG',
    'TERRANCE DILANG ANAK VINCENT UGAI',
    'TIMOTHY BIN JENNIS',
    'TIONG KWAN CHIEH',
    'TOH BES MIN',
    'TRACY CHUA PENG LING',
    'USIK ANAK BANSAN',
    'VALENTINE ANAK SADIN',
    'VANESSA AK PAWIE',
    'VANESSA ANAK GILBERT',
    'VICTOR ANAK TINSONG',
    'VICTOR RAPHAEL KOH',
    'VICTORIA CHARLES JUTA',
    'VINCENT ANAK JIHEM',
    'VINCENT ANDY SIEH',
    'VIVIAN NGU YEN SHYA',
    'WAN AIQAL DANIAL BIN WAN ADAM',
    'WAN AZIRUL AZREEN WAN ZAINAL ABIDIN',
    'WAN MAZLAN BIN WAN SAGAP',
    'WAN MOHD. ZULHEIMY BIN WAN ABU BAKAR',
    'WATHIEQ AKRAM BIN ANWAR',
    'WILSON ANAK JUNGAN',
    'WONG JINQ YUAN',
    'WONG LEH SOON',
    'YOU ROU CHEOK',
    'YU YANG LONG',
    "ZAIDI B HJ MA'SOUD",
    'ZULHAZAMI BIN JOHARI',
    'ZULKARNAIN BIN HANAPIS',
    'ZULKARNAIN BIN MAHANI',
    'ZULKIFLI BIN TURA',
    'CLARA RICKY BALA',
    'JOCELYN RURAN TAYUN',
    'MUHAMMAD SAIFUDDIN BIN ZULKAPLE',
    'SHAHRIZAL BIN EDEN',
    'HAZRINA BINTI HASNI',
    'NORASYIKIN BINTI JULIS',
    'MOHAMAD TAJUDDIN BIN PADIL@FADZIL',
    'SYED MUHAMMAD BIN SYED ABDUL KARIM',
    'CHAI HAH PING',
    'NORIZAN BINTI HAMDAN',
    'FRANKY BUDIT OMAR',
    'FAUZI BIN MD NORDIN',
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
    'NGU MING JIUN',
    'JAMES BUNGKONG ANAK RIMONG',
    'CHEW PAN HAO',
    'GANANG TAGAL',
    'PHIL FOSTER ANAK MASING',
    'MOHD AMRI BIN ROSLI',
    'RUTH LOH SIAW HUI',
    'FAKRUL RADZI BIN DRAHMAN',
    'ISHAK KHAN BIN MOHD KHAN',
    'SIMON ANAK ABANG',
    'AKMALARIFFIN BIN RUKIJAN',
    'RICKY IGNATIUS ANAK MERUNEI',
    'DZUL FAHMI BIN ZAWAWI',
    'JOHNNATAN ANAK UNGGANG',
    'MOHAMAD HISHAM BIN ABDUL RAHMAN',
    'MOHAMAD SAH NIZAM BIN SUBAHDURIN',
    'AWANG AHMAD NURAMBIA BIN AWANG KIPLI',
    'AUTHUR KREMLIN A/K TANJU',
    'SAFUANI WADZANIE',
    'MATHEW ANAK TANJU',
    'AZZAD AHMAD',
    'MUHAMMAD AZLAN BIN JOHARI',
    'MOHAMAD ZA FATHI BIN HASBI ZEN',
    'AISAMUDDIN BIN ALIAS'
  ];
})();
