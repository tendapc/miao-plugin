import { Common } from '#miao'
import { getTargetUid } from '../profile/ProfileCommon.js'
import GachaData from './GachaData.js'
import { Character, Player } from '#miao.models'

const button = segment.button([
  { text: "角色记录", callback: "#角色记录" },
  { text: "角色统计", callback: "#角色统计" },
],[
  { text: "武器记录", callback: "#武器记录" },
  { text: "武器统计", callback: "#武器统计" },
],[
  { text: "常驻记录", callback: "#常驻记录" },
  { text: "常驻统计", callback: "#常驻统计" },
])

let Gacha = {
  async detail (e) {
    let msg = e.msg.replace(/#|抽卡|记录|祈愿|分析|池/g, '')
    let type = 301
    switch (msg) {
      case 'up':
      case '抽卡':
      case '角色':
      case '抽奖':
        type = 301
        break
      case '常驻':
        type = 200
        break
      case '武器':
        type = 302
        break
    }
    let uid = e.uid || await getTargetUid(e)
    let qq = e.user_id
    if (!uid || !qq) {
      return false
    }

    let gacha = GachaData.analyse(e.user_id, uid, type)
    if (!gacha) {
      e.reply([`UID:${uid} 本地暂无抽卡信息，请通过【#抽卡帮助】获得绑定帮助...`, segment.button([
        { text: "抽卡帮助", callback: "#抽卡帮助" },
      ])])
      return true
    }
    this.reply([await Common.render('gacha/gacha-detail', {
      save_id: uid,
      uid,
      gacha,
      face: Gacha.getFace(uid)
    }, { e, scale: 1.4, retType: "base64" }), button])
  },
  async stat (e) {
    let msg = e.msg.replace(/#|统计|分析|池/g, '')
    let type = 'up'
    if (/武器/.test(msg)) {
      type = 'weapon'
    } else if (/角色/.test(msg)) {
      type = 'char'
    } else if (/常驻/.test(msg)) {
      type = 'normal'
    } else if (/全部/.test(msg)) {
      type = 'all'
    }
    let uid = e.uid || await getTargetUid(e)
    let qq = e.user_id
    if (!uid || !qq) {
      return false
    }
    let gacha = GachaData.stat(e.user_id, uid, type)
    if (!gacha) {
      e.reply([`UID:${uid} 本地暂无抽卡信息，请通过【#抽卡帮助】获得绑定帮助...`, segment.button([
        { text: "抽卡帮助", callback: "#抽卡帮助" },
      ])])
      return true
    }
    e.reply([await Common.render('gacha/gacha-stat', {
      save_id: uid,
      uid,
      gacha,
      face: Gacha.getFace(uid)
    }, { e, scale: 1.4, retType: "base64" }), button])
  },

  getFace (uid) {
    let player = Player.create(uid)

    let faceChar = Character.get(player.face || 10000014)
    let imgs = faceChar?.imgs
    if (!imgs?.face) {
      imgs = Character.get(10000079).imgs
    }
    return {
      banner: imgs?.banner,
      face: imgs?.face,
      qFace: imgs?.qFace,
      name: player.name || '旅行者',
      sign: player.sign,
      level: player.level
    }
  }
}
export default Gacha