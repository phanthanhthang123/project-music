const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'THANG_PLAYER'

const player = $('.player')
const playlist = $('.playlist')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config:  JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY))  || {} ,
    songs: [
        {
            name: "Hồng Nhan",
            singer: "Jack",
            path: "assets/music/hongnhan.mp3",
            image: "assets/img/hongnhan.jpg"
        },
        {
            name: "Đom Đóm",
            singer: "Jack",
            path: "assets/music/DomDom.mp3",
            image: "assets/img/domdom.jpg"
        },
        {
            name: "Mẹ Ơi 2",
            singer: "Jack",
            path: "assets/music/MeOi2.mp3",
            image: "assets/img/meoi2.jpg"
        },
        {
            name: "Thiên Lý Ơi",
            singer: "Jack",
            path: "assets/music/ThienLyOi.mp3",
            image: "assets/img/thienlyoi.jpg"
        },
        {
            name: "Về Bên Anh",
            singer: "Jack",
            path: "assets/music/VeBenAnh.mp3",
            image: "assets/img/vebenanh.jpg"
        }
    ],
    setConfig:function(key,value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config))
    },
    render: function () {
        const html = this.songs.map((song, index) => {
            return `<div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
            <div class="thumb"
                style="background-image: url('${song.image}');">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
        </div>`
        })
        playlist.innerHTML = html.join('')
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function () {
        const _this = this
        const cdWidth = cd.offsetWidth

        //Xu ly cd quay / dung
        const cdThumAnimate = cdThumb.animate([
            {
                transform: 'rotate(360deg)'
            }
        ], {
            duration: 10000, // 10s
            iterations: Infinity //vo han
        })
        cdThumAnimate.pause()

        //xu ly phong to , thu nho cd
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }
        //xu ly khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                // _this.isPlaying=false
                audio.pause()
                // player.classList.remove('playing')
            }
            else {
                // _this.isPlaying = true
                audio.play();
                // player.classList.add('playing')
            }
        }
        //Khi song duoc play
        audio.onplay = function () {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumAnimate.play()
        }
        //khi song bi pause
        audio.onpause = function () {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumAnimate.pause()
        }
        //khi tien do bai hat thay doi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        //xy ly khi tua song
        progress.onchange = function (e) {
            // console.log(e.target.value * audio.duration / 100) : so giay hien tai
            const seekTime = e.target.value * audio.duration / 100
            audio.currentTime = seekTime
        }

        //Khi next song 
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        //khi prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        //Xu ly random bat/tat
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom',_this.isRandom )
            randomBtn.classList.toggle('active', _this.isRandom)
            // console.log(_this.randomBtn)
        }

        //xu ly phat lai 1 bai hat (repeat)
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat',_this.isRepeat )
            repeatBtn.classList.toggle('active', _this.isRepeat)

        }
        //Xu ly next song khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
            } else {
                if (_this.isRandom) {
                    _this.playRandomSong()
                } else {
                    _this.nextSong()
                }
                audio.play()
            }
        }
        //lang nghe  hanh vi click vao playlist
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');

            // closet() --> tra ve chinh no hoac the cha cua no , neu k co tra ve null
            if (e.target.closest('.song:not(.active)') || e.target.closest('.option')) {
                //xu li khi click vao song
                if (e.target.closest('.song:not(.active)')) {
                    // console.log(songNode.getAttribute('data-index'))
                    _this.currentIndex = Number(songNode.getAttribute('data-index'))
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }

                //xu li khi click vao option
                if (e.target.closest('.option')) {

                }
            }
            // console.log(e.target.closest('.song:not(.active)'))
        }
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth', //Hanh vi : muot ma,tron tru
                block: 'nearest', //vi tri keo khoois towis, nearest : den gan

            })
        }, 300)
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    loadConfig:function(){
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex

        this.loadCurrentSong()

    },
    start: function () {
        //gan cau hinh tu config vao ung dung
        this.loadConfig()

        //dinh nghia cac thuoc tinh cho object
        this.defineProperties()

        //lang nghe , xu ly cac su kien
        this.handleEvents()

        //tai thong tin bai hat dau tien vao UI khi chay ung dung
        this.loadCurrentSong()

        //render lai playlist
        this.render()


        //hien thi trang thai ban dau cua button repeat & random
        randomBtn.classList.toggle('active',this.isRandom)
        repeatBtn.classList.toggle('active',this.isRepeat)
    }
}

app.start()



/**
 1. render song
 2.Scroll top
 3.Play/Pause/seek
 4.CD rotate
 5.next / prev
 6.Random
 7.Next/Reapt when ended
 8.Active Song
 9.Scroll active song intro view
 10.Play song when click
**/