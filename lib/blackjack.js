var cards = require("./cards")

// Blackjack game.
function BlackjackGame() {
	this.dealerHand = new BlackjackHand()
	this.playerHand = new BlackjackHand()
	this.AI_hand = new BlackjackHand()
	this.aiStay = false
	this.result = "None"
	this.AIresult = "None"
	this.cards = cards.createPlayingCards()
}

BlackjackGame.prototype.newGame = function () {
	this.aiStay = false

	this.dealerHand = new BlackjackHand()
	this.playerHand = new BlackjackHand()
	this.AI_hand = new BlackjackHand()

	this.playerHand.addCard(this.cards.dealNextCard())
	this.dealerHand.addCard(this.cards.dealNextCard())

	this.playerHand.addCard(this.cards.dealNextCard())
	this.AI_hand.addCard(this.cards.dealNextCard())
	this.AI_hand.addCard(this.cards.dealNextCard())

	this.result = "None"
}

BlackjackGame.prototype.isInProgress = function () {
	return this.result === "None" && this.dealerHand.hasCards()
}

BlackjackGame.prototype.toJson = function () {
	return {
		dealer: {
			cards: this.dealerHand.getCards(),
			score: this.dealerHand.getScore(),
		},
		player: {
			cards: this.playerHand.getCards(),
			score: this.playerHand.getScore(),
			balance: 102.5,
		},
		ai_player: {
			cards: this.AI_hand.getCards(),
			score: this.AI_hand.getScore(),
			balance: 102.5,
		},
		result: this.result,
		// AIresult: this.AIresult,
	}
}

BlackjackGame.prototype.getResultForPlayer = function () {
	var score = this.playerHand.getScore()
	if (score > 21) {
		return "Bust"
	}
	return "None"
}

BlackjackGame.prototype.getResultForAI = function () {
	var score = this.AI_hand.getScore()
	if (score > 21) {
		return "Bust"
	}
	return "None"
}

BlackjackGame.prototype.isGameInProgress = function () {
	return this.result === "None"
}

BlackjackGame.prototype.makeAiMove = function () {
	var ai_score = this.AI_hand.getScore()
	let playerCards = this.playerHand.getVisibleCards()

	let player_total = 0
	for (let card of playerCards) {
		if (card) {
			player_total += card.rank
		}
	}
	// if (!this.aiStay) {
	if (ai_score < 21 && this.getResultForPlayer() != "Bust") {
		//if player has one visible card and its 10 or higher, hit
		if (playerCards.length == 1 && player_total >= 10) {
			this.AI_hand.addCard(this.cards.dealNextCard())
		} else {
			//if ai is between 18 and 20
			if ((ai_score) => 18 && ai_score <= 20) {
				//if player has mroe than score - 10
				if (player_total > ai_score - 10) {
					this.AI_hand.addCard(this.cards.dealNextCard())
				} else {
					this.aiStay = true
				}
			} else {
				this.AI_hand.addCard(this.cards.dealNextCard())
			}
		}
	} else {
		this.aiStay = true
	}
	this.aiStay
	this.AIresult = this.getResultForAI()
}

BlackjackGame.prototype.hit = function () {
	if (this.isGameInProgress()) {
		this.playerHand.addCard(this.cards.dealNextCard())
		this.result = this.getResultForPlayer()

		//make ai move
		this.makeAiMove()

		if (this.AI_hand.check7Card() || this.playerHand.check7Card()) {
			this.result = this.getResult()
		}
	}
}

BlackjackGame.prototype.getResult = function () {
	let playerScore
	var dealerScore
	var aiScore

	if (this.AI_hand.check7Card()) {
		// console.log("ai by 7 card")
		return "AI wins by 7 Card Charlie"
	} else if (this.playerHand.check7Card()) {
		return "player wins by 7 Card Charlie"
	}

	//see if anyone busts
	if (!this.playerHand.isBust()) {
		playerScore = this.playerHand.getScore()
	} else {
		playerScore = 0
	}

	if (!this.dealerHand.isBust()) {
		dealerScore = this.dealerHand.getScore()
	} else {
		dealerScore = 0
	}

	if (!this.AI_hand.isBust()) {
		aiScore = this.AI_hand.getScore()
	} else {
		aiScore = 0
	}

	//player is higher then dealerscore
	if (playerScore > dealerScore) {
		if (playerScore > aiScore) {
			return "Win"
		} else if (playerScore < aiScore) {
			return "AI Win"
		} else if (aiScore == playerScore) {
			if (this.AI_hand.getCards.length < this.playerHand.getCards.length) {
				return "win"
			} else if (
				this.AI_hand.getCards.length > this.playerHand.getCards.length
			) {
				return "AI Win"
			} else {
				return "AI and Player Tie"
			}
		}
		//player is lower then dealer score
	} else if (playerScore < dealerScore) {
		if (dealerScore > aiScore) {
			return "Dealer Win"
		} else if (dealerScore < aiScore) {
			return "AI Win"
		} else if (aiScore == dealerScore) {
			if (this.AI_hand.getCards.length < this.dealerHand.getCards.length) {
				return "Dealer Win"
			} else if (
				this.AI_hand.getCards.length > this.dealerHand.getCards.length
			) {
				return "AI Win"
			} else {
				return "AI and Dealer Tie"
			}
		}
		//player and dealer tie
	} else {
		if (playerScore < aiScore) {
			return "AI Win"
		} else {
			return "Three way Tie"
		}
	}
}

BlackjackGame.prototype.stand = function () {
	if (this.isGameInProgress()) {
		while (this.dealerHand.getScore() < 17) {
			this.dealerHand.addCard(this.cards.dealNextCard())
		}

		//make ai move until it stays
		while (!this.aiStay) {
			this.makeAiMove()
		}

		//final move of the game
		this.result = this.getResult()
	}
}

// Blackjack hand.
function BlackjackHand() {
	this.cards = []
}

BlackjackHand.prototype.hasCards = function () {
	return this.cards.length > 0
}

BlackjackHand.prototype.addCard = function (card) {
	this.cards.push(card)
}

BlackjackHand.prototype.numberToSuit = function (number) {
	var suits = ["C", "D", "H", "S"]
	var index = Math.floor(number / 13)
	return suits[index]
}

BlackjackHand.prototype.numberToCard = function (number) {
	return {
		rank: (number % 13) + 1,
		suit: this.numberToSuit(number),
	}
}

BlackjackHand.prototype.check7Card = function () {
	let score = this.getScore()

	if (this.cards.length >= 7 && score < 21) {
		return true
	}
	return false
}

BlackjackHand.prototype.getCards = function () {
	var convertedCards = []
	for (var i = 0; i < this.cards.length; i++) {
		var number = this.cards[i]
		convertedCards[i] = this.numberToCard(number)
	}
	return convertedCards
}

BlackjackHand.prototype.getVisibleCards = function () {
	var convertedCards = []
	for (var i = 1; i < this.cards.length; i++) {
		var number = this.cards[i]
		convertedCards[i] = this.numberToCard(number)
	}
	return convertedCards
}

BlackjackHand.prototype.getCardScore = function (card) {
	if (card.rank === 1) {
		return 11
	} else if (card.rank >= 11) {
		return 10
	}
	return card.rank
}

BlackjackHand.prototype.getScore = function () {
	var score = 0
	var cards = this.getCards()
	var aces = []

	// Sum all cards excluding aces.
	for (var i = 0; i < cards.length; ++i) {
		var card = cards[i]
		if (card.rank === 1) {
			aces.push(card)
		} else {
			score = score + this.getCardScore(card)
		}
	}

	// Add aces.
	if (aces.length > 0) {
		var acesScore = aces.length * 11
		var acesLeft = aces.length
		while (acesLeft > 0 && acesScore + score > 21) {
			acesLeft = acesLeft - 1
			acesScore = acesScore - 10
		}
		score = score + acesScore
	}

	return score
}

BlackjackHand.prototype.isBust = function () {
	return this.getScore() > 21
}

// Exports.
function newGame() {
	return new BlackjackGame()
}

exports.newGame = newGame
