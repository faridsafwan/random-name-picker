/* eslint-disable no-plusplus */
interface Winner {
  number: number;
  name: string;
  img: string;
  prize: string;
}
interface WinnerListItem {
  winners: Winner[];
}
interface SlotConfigurations {
  /** User configuration for maximum item inside a reel */
  maxReelItems?: number;
  /** User configuration for whether winner should be removed from name list */
  removeWinner?: boolean;
  /** User configuration for element selector which reel items should append to */
  reelContainerSelector: string;
  /** Start of Grand Prize */
  grandPrizeStartNo: number;
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

  /** Start of Grand Prize */
  grandPrizeStartNo: number;

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
   * @param maxReelItems  Maximum item inside a reel
   * @param onSpinStart  Callback function that runs before spinning reel
   * @param onNameListChanged  Callback function that runs when user updates the name list
   * @param onShowWinnerPopup Callback function that show winner popup
   */
  constructor(
    {
      maxReelItems = 30,
      removeWinner = true,
      reelContainerSelector,
      grandPrizeStartNo,
      onSpinStart,
      onSpinEnd,
      onNameListChanged,
      onShowWinnerPopup
    }: SlotConfigurations
  ) {
    this.nameList = [];
    this.winnerList = [];
    this.prizeNumber = 8;
    this.grandPrizeStartNo = grandPrizeStartNo;
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
  public async spin(isRedraw): Promise<boolean> {
    const prizeData = {
      prizes: [
        { number: 1, name: 'APRILIA SR GT 200 REPLICA (Worth RM20,900)', img: '1.png' },
        { number: 2, name: 'MODENAS - DOMINAR 250 THE DUAL TONE EDITION (WORTH RM13,797)', img: '2.png' },
        { number: 3, name: 'MODENAS - KARISMA EX 125 COLOUR YOUR LIFESTYLE (WORTH RM5,797)', img: '3.png' },
        { number: 4, name: 'G-FLEX NECK & SHOULDER MASSAGER (WORTH RM2,288)', img: '4.png' },
        { number: 5, name: 'INSTA 360 GO 3S (WORTH RM2,100)', img: '5.png' },
        { number: 6, name: 'APPLE WATCH SE (WORTH RM1,200)', img: '6.png' },
        { number: 7, name: 'Push Bike', img: '7.png' },
        { number: 8, name: '3D2N STAY AT SUPERIOR KING ROOM, M RESORT & HOTEL KUALA LUMPUR (WORTH RM880 NETT)', img: '8.jpg' }
      ]
    };
    if (!this.nameList.length) {
      console.error('Name List is empty. Cannot start spinning.');
      return false;
    }
    // Increase back the prize number
    // Remove previous winner
    if (isRedraw) {
      if (this.prizeNumber >= 10) {
        this.prizeNumber += 10;
        this.winnerList.pop();
      } else if (this.prizeNumber === 9) {
        this.prizeNumber += 1;
        this.winnerList.pop();
      } else if (this.prizeNumber < 9) {
        this.prizeNumber += 1;
        this.winnerList[this.winnerList.length - 1].winners.pop();
      }
    }
    console.log(this.prizeNumber, 'reset prize number');

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

    randomNames.forEach((name) => {
      const newReelItem = document.createElement('div');
      newReelItem.innerHTML = name;
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
    console.log(this.prizeNumber, 'prizeNumber');

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
      if (prize) {
        winner.img = `assets/images/prize/${prize.img}`;
        winner.prize = prize.name;
      }
      winnersWithPrize.push(winner);
    }

    if (this.prizeNumber === this.grandPrizeStartNo) {
      // Push 1 winner
      this.winnerList.push({
        winners: [winnersWithPrize[0]]
      });
    } else if (this.prizeNumber <= this.grandPrizeStartNo - 1) {
      if (!this.winnerList.length) {
        this.winnerList.push({
          winners: []
        });
      }
      this.winnerList[this.winnerList.length - 1].winners.push(winnersWithPrize[0]);
    } else {
      // Push 10 winner
      this.winnerList.push({
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
    const nameList = JSON.stringify(this.nameList);
    localStorage.setItem('remaining', nameList);

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
}
