/* eslint-disable no-plusplus */
interface Winner {
  number: number;
  name: string;
  img: string;
  prize: string;
}
interface WinnerListItem {
  setTitle: string;
  winners: Winner[];
}
interface SlotConfigurations {
  /** User configuration for maximum item inside a reel */
  maxReelItems?: number;
  /** User configuration for whether winner should be removed from name list */
  removeWinner?: boolean;
  /** User configuration for element selector which reel items should append to */
  reelContainerSelector: string;
  /** User configuration for callback function that runs before spinning reel */
  onSpinStart?: () => void;
  /** User configuration for callback function that runs after spinning reel */
  onSpinEnd?: () => void;

  /** User configuration for callback function that runs after user updates the name list */
  onNameListChanged?: () => void;

  /** User configuration to show winner popup */
  onShowWinnerPopup?: () => void;
}

/** Class for doing random name pick and animation */
export default class Slot {
  /** List of names to draw from */
  private nameList: string[];

  /** List of winners */
  private winnerList: WinnerListItem[] = [];

  /** Prize Number */
  private prizeNumber: number;

  /** Whether there is a previous winner element displayed in reel */
  private havePreviousWinner: boolean;

  /** Container that hold the reel items */
  private reelContainer: HTMLElement | null;

  /** Maximum item inside a reel */
  private maxReelItems: NonNullable<SlotConfigurations['maxReelItems']>;

  /** Whether winner should be removed from name list */
  private shouldRemoveWinner: NonNullable<SlotConfigurations['removeWinner']>;

  /** Reel animation object instance */
  private reelAnimation?: Animation;

  /** Callback function that runs before spinning reel */
  private onSpinStart?: NonNullable<SlotConfigurations['onSpinStart']>;

  /** Callback function that runs after spinning reel */
  private onSpinEnd?: NonNullable<SlotConfigurations['onSpinEnd']>;

  /** Callback function that runs after spinning reel */
  private onNameListChanged?: NonNullable<SlotConfigurations['onNameListChanged']>;

  /** Callback function that show winner popup */
  private onShowWinnerPopup?: NonNullable<SlotConfigurations['onShowWinnerPopup']>;

  /**
   * Constructor of Slot
   * @param maxReelItems  Maximum item inside a reel
   * @param removeWinner  Whether winner should be removed from name list
   * @param reelContainerSelector  The element ID of reel items to be appended
   * @param onSpinStart  Callback function that runs before spinning reel
   * @param onNameListChanged  Callback function that runs when user updates the name list
   * @param onShowWinnerPopup Callback function that show winner popup
   */
  constructor(
    {
      maxReelItems = 30,
      removeWinner = true,
      reelContainerSelector,
      onSpinStart,
      onSpinEnd,
      onNameListChanged,
      onShowWinnerPopup
    }: SlotConfigurations
  ) {
    this.nameList = [];
    this.winnerList = [];
    this.prizeNumber = 30;
    this.havePreviousWinner = false;
    this.reelContainer = document.querySelector(reelContainerSelector);
    this.maxReelItems = maxReelItems;
    this.shouldRemoveWinner = removeWinner;
    this.onSpinStart = onSpinStart;
    this.onSpinEnd = onSpinEnd;
    this.onNameListChanged = onNameListChanged;
    this.onShowWinnerPopup = onShowWinnerPopup;

    // Create reel animation
    this.reelAnimation = this.reelContainer?.animate(
      [
        { transform: 'none', filter: 'blur(0)' },
        { filter: 'blur(1px)', offset: 0.5 },
        // Here we transform the reel to move up and stop at the top of last item
        // "(Number of item - 1) * height of reel item" of wheel is the amount of pixel to move up
        // 7.5rem * 16 = 120px, which equals to reel item height
        { transform: `translateY(-${(this.maxReelItems - 1) * (7.5 * 16)}px)`, filter: 'blur(0)' }
      ],
      {
        duration: this.maxReelItems * 100, // 100ms for 1 item
        easing: 'ease-in-out',
        iterations: 1
      }
    );

    this.reelAnimation?.cancel();
  }

  /**
   * Setter for name list
   * @param names  List of names to draw a winner from
   */
  set names(names: string[]) {
    this.nameList = names;

    const reelItemsToRemove = this.reelContainer?.children
      ? Array.from(this.reelContainer.children)
      : [];

    reelItemsToRemove
      .forEach((element) => element.remove());

    this.havePreviousWinner = false;

    if (this.onNameListChanged) {
      this.onNameListChanged();
    }
  }

  /** Getter for name list */
  get names(): string[] {
    return this.nameList;
  }

  /** Getter for winner list */
  get winner(): WinnerListItem[] {
    return this.winnerList;
  }

  /** Getter for prize number */
  get currentPrizeNumber(): number {
    return this.prizeNumber;
  }

  /**
   * Setter for shouldRemoveWinner
   * @param removeWinner  Whether the winner should be removed from name list
   */
  set shouldRemoveWinnerFromNameList(removeWinner: boolean) {
    this.shouldRemoveWinner = removeWinner;
  }

  /** Getter for shouldRemoveWinner */
  get shouldRemoveWinnerFromNameList(): boolean {
    return this.shouldRemoveWinner;
  }

  /**
   * Returns a new array where the items are shuffled
   * @template T  Type of items inside the array to be shuffled
   * @param array  The array to be shuffled
   * @returns The shuffled array
   */
  private static shuffleNames<T = unknown>(array: T[]): T[] {
    const keys = Object.keys(array) as unknown[] as number[];
    const result: T[] = [];
    for (let k = 0, n = keys.length; k < array.length && n > 0; k += 1) {
      // eslint-disable-next-line no-bitwise
      const i = Math.random() * n | 0;
      const key = keys[i];
      result.push(array[key]);
      n -= 1;
      const tmp = keys[n];
      keys[n] = key;
      keys[i] = tmp;
    }
    return result;
  }

  /**
   * Function for spinning the slot
   * @returns Whether the spin is completed successfully
   */
  public async spin(): Promise<boolean> {
    const prizeData = {
      prizes: [
        { number: 1, name: 'HABIB JEWELS - GOLD BAR 999.9 (SONGKET EDITION) (5, 1 & 1 GRAM) - 10 SET', img: 'goldbar.png' },
        { number: 2, name: 'HABIB JEWELS - GOLD BAR 999.9 (SONGKET EDITION) (5, 1 & 1 GRAM) - 10 SET', img: 'goldbar.png' },
        { number: 3, name: 'HABIB JEWELS - GOLD BAR 999.9 (SONGKET EDITION) (5, 1 & 1 GRAM) - 10 SET', img: 'goldbar.png' },
        { number: 4, name: 'HABIB JEWELS - GOLD BAR 999.9 (SONGKET EDITION) (5, 1 & 1 GRAM) - 10 SET', img: 'goldbar.png' },
        { number: 5, name: 'HABIB JEWELS - GOLD BAR 999.9 (SONGKET EDITION) (5, 1 & 1 GRAM) - 10 SET', img: 'goldbar.png' },
        { number: 6, name: 'SONY PS5 DISC VERSION CFI-1218A', img: 'ps5.png' },
        { number: 7, name: 'DYSON V8 SLIM FLUFFY PLUS CORDLESS VACUUM', img: 'dyson.png' },
        { number: 8, name: 'APPLE IPAD 10TH GEN/WIFI/64GB/10.9"', img: 'ipad.png' },
        { number: 9, name: 'ELECTROLUX 8.5KG FRONT LOAD VENTING DRYER EDV854J3WD', img: 'electrolux.png' },
        { number: 10, name: 'SAMSUNG 50" CRYSTAL UHD 4K SMART TV UA50AU7000KXXM', img: 'tv.png' },
        { number: 11, name: 'PHILIPS PERFECTCARE 7000 SERIES STEAM GENERATORPSG7130/20', img: '' },
        { number: 12, name: 'PHILIPS PERFECTCARE 7000 SERIES STEAM GENERATORPSG7130/20', img: '' },
        { number: 13, name: 'Wireless Headphones', img: '' },
        { number: 14, name: 'Coffee Maker', img: '' },
        { number: 15, name: 'Fitness Tracker', img: '' },
        { number: 16, name: 'GoPro Camera', img: '' },
        { number: 17, name: 'Amazon Echo', img: '' },
        { number: 18, name: 'Robot Vacuum', img: '' },
        { number: 19, name: 'Chromebook', img: '' },
        { number: 20, name: 'Wireless Charging Pad', img: '' },
        { number: 21, name: 'Instant Pot', img: '' },
        { number: 22, name: 'Bluetooth Earbuds', img: '' },
        { number: 23, name: 'Air Fryer', img: '' },
        { number: 24, name: 'Nintendo Switch', img: '' },
        { number: 25, name: 'Smart Thermostat', img: '' },
        { number: 26, name: 'Digital Camera', img: '' },
        { number: 27, name: 'Laptop', img: '' },
        { number: 28, name: 'Wireless Mouse and Keyboard', img: '' },
        { number: 29, name: 'Portable Projector', img: '' },
        { number: 30, name: 'VR Headset', img: '' },
        { number: 31, name: 'Coffee Table Book Collection', img: '' },
        { number: 32, name: 'Smart Home Hub', img: '' },
        { number: 33, name: 'Desk Organizer', img: '' },
        { number: 34, name: 'Wireless Router', img: '' },
        { number: 35, name: 'Bluetooth Keyboard', img: '' },
        { number: 36, name: 'Digital Picture Frame', img: '' },
        { number: 37, name: 'Portable Charger', img: '' },
        { number: 38, name: 'Smart Doorbell', img: '' },
        { number: 39, name: 'Electric Toothbrush', img: '' },
        { number: 40, name: 'Streaming Stick', img: '' },
        { number: 41, name: 'Wireless Printer', img: '' },
        { number: 42, name: 'Bluetooth Gaming Controller', img: '' },
        { number: 43, name: 'SAMSUNG 7.0 KG FULLY AUTO WASHING MACHINEWA70H4000SG/FQ', img: '' },
        { number: 44, name: 'SAMSUNG 30L GRILL MICROWAVE OVEN HEALTHY GRILL FLY', img: '' },
        { number: 45, name: 'PHILIPS STEAM IRON BOARD V2 GC7846/86', img: '' },
        { number: 46, name: 'SAMSUNG B- SERIES SOUNDBAR C450 BLACK', img: '' },
        { number: 47, name: 'PANASONIC 32" LED HD TV TH-32H410K', img: '' },
        { number: 48, name: 'SSF CASH VOUCHER (WORTH RM 700)', img: '' },
        { number: 49, name: 'PHILIPS 6.2L XL ESSENTIAL AIR FRYER WITH NUTRIU APHD9280/91', img: '' },
        { number: 50, name: 'TTRACING DUO V4 PRO AIR THREADS FABRIC GAMING CHAIR', img: '' }
      ]
    };
    if (!this.nameList.length) {
      console.error('Name List is empty. Cannot start spinning.');
      return false;
    }

    if (this.onSpinStart) {
      this.onSpinStart();
    }

    const { reelContainer, reelAnimation, shouldRemoveWinner } = this;
    if (!reelContainer || !reelAnimation) {
      return false;
    }

    // Shuffle names and create reel items
    let randomNames = Slot.shuffleNames<string>(this.nameList);

    while (randomNames.length && randomNames.length < this.maxReelItems) {
      randomNames = [...randomNames, ...randomNames];
    }

    randomNames = randomNames.slice(0, this.maxReelItems - Number(this.havePreviousWinner));

    const fragment = document.createDocumentFragment();

    randomNames.forEach((name, index, array) => {
      const newReelItem = document.createElement('div');
      // Add a number to the name if it's the last one
      const newName = index === array.length - 1 ? `#${this.prizeNumber} - ${name}` : name;
      newReelItem.innerHTML = newName;
      fragment.appendChild(newReelItem);
    });
    if (this.prizeNumber <= 10) {
      reelContainer.appendChild(fragment);
    }
    // console.log('Displayed items: ', randomNames);
    console.log('Name List: ', this.nameList);
    console.log('Winner: ', randomNames[randomNames.length - 1]);

    // set winners array
    const winnersWithPrize: Winner[] = [];
    console.log(this.prizeNumber, 'this.prizeNumber1');

    if (this.prizeNumber > 10) {
      // Add 10 winners to the array with unique numbers and decrease prizeNumber
      for (let i = 0; i < 10; i++) {
        const winner = {
          number: this.prizeNumber - i, // Decrease prizeNumber
          name: randomNames[randomNames.length - 1 - i], //
          img: '',
          prize: ''
        };
        const prize = prizeData.prizes.find((p) => p.number === winner.number);
        if (prize) {
          winner.img = `assets/images/prize/${prize.img}`;
          winner.prize = prize.name;
        }
        winnersWithPrize.push(winner);
      }
    } else {
      // Add only one winner to the array with a unique number and increment prizeNumber
      const winner = {
        number: this.prizeNumber,
        name: randomNames[randomNames.length - 1],
        img: '',
        prize: ''
      };
      const prize = prizeData.prizes.find((p) => p.number === this.prizeNumber);
      console.log(prize, 'prize');
      if (prize) {
        winner.img = `assets/images/prize/${prize.img}`;
        winner.prize = prize.name;
      }
      winnersWithPrize.push(winner);
    }
    const roundIndex = this.getRoundIndex();

    let title = '';
    if (this.prizeNumber <= 10) {
      title = 'Grand Set';
    } else if (this.prizeNumber <= 50) {
      title = 'Semi Grand Set';
    } else if (this.prizeNumber <= 100) {
      title = 'Set 2';
    } else if (this.prizeNumber <= 150) {
      title = 'Set 1';
    }
    if (this.prizeNumber === 10) {
      // Push 1 winner
      this.winnerList.push({
        setTitle: title,
        winners: [winnersWithPrize[0]]
      });
    } else if (this.prizeNumber <= 9) {
      this.winnerList[roundIndex].winners.push(winnersWithPrize[0]);
    } else {
      // Push 10 winner
      this.winnerList.push({
        setTitle: title,
        winners: winnersWithPrize
      });
      if (this.onShowWinnerPopup) {
        this.onShowWinnerPopup();
      }
    }
    console.log(this.winnerList, 'this.winnerList');

    // Remove winner form name list if necessary
    if (shouldRemoveWinner === true) {
      if (this.prizeNumber > 10) {
        for (let i = 0; i < 10; i++) {
          this.nameList.splice(
            this.nameList.findIndex(
              (name) => name === randomNames[randomNames.length - 1 - i]
            ),
            1
          );
        }
      } else {
        this.nameList.splice(
          this.nameList.findIndex(
            (name) => name === randomNames[randomNames.length - 1]
          ),
          1
        );
      }
    }

    console.log('Remaining: ', this.nameList);

    // Play the spin animation
    const animationPromise = new Promise((resolve) => {
      reelAnimation.onfinish = resolve;
    });

    reelAnimation.play();

    await animationPromise;

    // Sets the current playback time to the end of the animation
    // Fix issue for animatin not playing after the initial play on Safari
    reelAnimation.finish();

    Array.from(reelContainer.children)
      .slice(0, reelContainer.children.length - 1)
      .forEach((element) => element.remove());

    this.havePreviousWinner = true;

    if (this.onSpinEnd) {
      this.onSpinEnd();
    }

    if (this.prizeNumber > 10) {
      this.prizeNumber -= 10; // Increment prizeNumber by 10
    } else {
      this.prizeNumber -= 1; // Increment prizeNumber by 1
    }
    return true;
  }

  // Function to get the round index
  getRoundIndex() {
    return this.winnerList.findIndex((round) => round.setTitle === 'Grand Set');
  }
}
