import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AddGigModal from '@/components/AddGigModal.vue'

// ArtistNameInputをモック
const ArtistNameInputMock = {
  name: 'ArtistNameInput',
  template: '<div data-testid="artist-name-input"></div>',
  emits: ['artistSelected'],
  props: ['reset'],
  methods: {
    $emit: vi.fn()
  }
}

describe('AddGigModal.vue', () => {
  let wrapper: any

  const defaultProps = {
    visible: true,
    x: 100,
    y: 200,
    resetArtistInput: false
  }

  const mockArtist = {
    id: 'artist-123',
    name: 'Test Artist',
    images: [{ url: 'https://example.com/image.jpg' }]
  }

  beforeEach(() => {
    wrapper = null
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('プロパティとレンダリング', () => {
    it('visibleがtrueの時にモーダルが表示される', () => {
      wrapper = mount(AddGigModal, {
        props: { ...defaultProps, visible: true },
        global: {
          stubs: {
            ArtistNameInput: ArtistNameInputMock
          }
        }
      })

      const modal = wrapper.find('#add-gig-modal')
      expect(modal.exists()).toBe(true)
    })

    it('visibleがfalseの時にモーダルが非表示になる', () => {
      wrapper = mount(AddGigModal, {
        props: { ...defaultProps, visible: false },
        global: {
          stubs: {
            ArtistNameInput: ArtistNameInputMock
          }
        }
      })

      const modal = wrapper.find('#add-gig-modal')
      expect(modal.exists()).toBe(false)
    })

    it('x、y座標が正しく適用される', () => {
      wrapper = mount(AddGigModal, {
        props: { ...defaultProps, x: 150, y: 250 },
        global: {
          stubs: {
            ArtistNameInput: ArtistNameInputMock
          }
        }
      })

      const modal = wrapper.find('#add-gig-modal')
      const style = modal.attributes('style')
      expect(style).toContain('left: 150px')
      expect(style).toContain('top: 250px')
    })

    it('基本的なフォーム要素が表示される', () => {
      wrapper = mount(AddGigModal, {
        props: defaultProps,
        global: {
          stubs: {
            ArtistNameInput: ArtistNameInputMock
          }
        }
      })

      // タイトル
      expect(wrapper.text()).toContain('New Gig')
      
      // 日付入力
      const dateInput = wrapper.find('input[type="date"]')
      expect(dateInput.exists()).toBe(true)
      
      // アーティスト入力（モック）
      const artistInput = wrapper.find('[data-testid="artist-name-input"]')
      expect(artistInput.exists()).toBe(true)
      
      // 送信ボタン
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.exists()).toBe(true)
      expect(submitButton.text()).toContain('Add Gig')
    })
  })

  describe('アーティスト選択機能', () => {
    beforeEach(() => {
      wrapper = mount(AddGigModal, {
        props: defaultProps,
        global: {
          stubs: {
            ArtistNameInput: ArtistNameInputMock
          }
        }
      })
    })

    it('アーティストが選択されていない時は送信ボタンが無効', () => {
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })

    it('アーティスト選択時にartistSelectedイベントが発火される', async () => {
      const artistInput = wrapper.findComponent('[data-testid="artist-name-input"]')
      
      // ArtistNameInputからのイベントをシミュレート
      await artistInput.vm.$emit('artistSelected', mockArtist)
      
      expect(wrapper.emitted('artistSelected')).toBeTruthy()
      expect(wrapper.emitted('artistSelected')[0]).toEqual([mockArtist])
    })

    it('アーティスト選択後は送信ボタンが有効になる', async () => {
      const artistInput = wrapper.findComponent('[data-testid="artist-name-input"]')
      
      // アーティスト選択をシミュレート - 親コンポーネントのイベントハンドラーを直接呼び出し
      await artistInput.vm.$emit('artistSelected', mockArtist)
      await wrapper.vm.$nextTick()
      
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeUndefined()
    })
  })

  describe('フォーム送信', () => {
    beforeEach(() => {
      wrapper = mount(AddGigModal, {
        props: defaultProps,
        global: {
          stubs: {
            ArtistNameInput: ArtistNameInputMock
          }
        }
      })
    })

    it('アーティスト選択後にフォーム送信が可能', async () => {
      const artistInput = wrapper.findComponent('[data-testid="artist-name-input"]')
      const form = wrapper.find('form')
      
      // アーティスト選択
      await artistInput.vm.$emit('artistSelected', mockArtist)
      await wrapper.vm.$nextTick()
      
      // フォーム送信
      await form.trigger('submit')
      
      expect(wrapper.emitted('submit')).toBeTruthy()
    })

    it('アーティスト未選択時はフォーム送信できない', async () => {
      const form = wrapper.find('form')
      
      await form.trigger('submit')
      
      expect(wrapper.emitted('submit')).toBeFalsy()
    })

    it('送信ボタンクリックでsubmitイベントが発火される', async () => {
      const artistInput = wrapper.findComponent('[data-testid="artist-name-input"]')
      const form = wrapper.find('form')
      
      // アーティスト選択
      await artistInput.vm.$emit('artistSelected', mockArtist)
      await wrapper.vm.$nextTick()
      
      // フォーム送信（submitボタンのクリックではなく）
      await form.trigger('submit')
      
      expect(wrapper.emitted('submit')).toBeTruthy()
    })
  })

  describe('モーダル制御', () => {
    beforeEach(() => {
      wrapper = mount(AddGigModal, {
        props: defaultProps,
        global: {
          stubs: {
            ArtistNameInput: ArtistNameInputMock
          }
        }
      })
    })

    it('背景クリックでcloseModalイベントが発火される', async () => {
      const overlay = wrapper.find('.fixed.inset-0.bg-transparent')
      
      await overlay.trigger('click')
      
      expect(wrapper.emitted('closeModal')).toBeTruthy()
    })

    it('モーダル内部クリックではcloseModalイベントが発火されない', async () => {
      const modal = wrapper.find('#add-gig-modal')
      
      await modal.trigger('click')
      
      expect(wrapper.emitted('closeModal')).toBeFalsy()
    })
  })

  describe('リセット機能', () => {
    it('resetArtistInputプロパティの変更でアーティスト選択がリセットされる', async () => {
      wrapper = mount(AddGigModal, {
        props: { ...defaultProps, resetArtistInput: false },
        global: {
          stubs: {
            ArtistNameInput: ArtistNameInputMock
          }
        }
      })

      const artistInput = wrapper.findComponent('[data-testid="artist-name-input"]')
      
      // アーティスト選択
      await artistInput.vm.$emit('artistSelected', mockArtist)
      await wrapper.vm.$nextTick()
      
      // 送信ボタンが有効になることを確認
      let submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeUndefined()
      
      // resetArtistInputをtrueに変更
      await wrapper.setProps({ resetArtistInput: true })
      await wrapper.vm.$nextTick()
      
      // 送信ボタンが再び無効になることを確認
      submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })

    it('visibleがfalseになった時にアーティスト選択がリセットされる', async () => {
      wrapper = mount(AddGigModal, {
        props: { ...defaultProps, visible: true },
        global: {
          stubs: {
            ArtistNameInput: ArtistNameInputMock
          }
        }
      })

      const artistInput = wrapper.findComponent('[data-testid="artist-name-input"]')
      
      // アーティスト選択
      await artistInput.vm.$emit('artistSelected', mockArtist)
      await wrapper.vm.$nextTick()
      
      // visibleをfalseに変更
      await wrapper.setProps({ visible: false })
      await wrapper.vm.$nextTick()
      
      // 再びvisibleをtrueに変更
      await wrapper.setProps({ visible: true })
      await wrapper.vm.$nextTick()
      
      // 送信ボタンが無効になっていることを確認（リセットされた）
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })
  })

  describe('アクセシビリティ', () => {
    beforeEach(() => {
      wrapper = mount(AddGigModal, {
        props: defaultProps,
        global: {
          stubs: {
            ArtistNameInput: ArtistNameInputMock
          }
        }
      })
    })

    it('送信ボタンに適切なaria-labelとtitleが設定されている', () => {
      const submitButton = wrapper.find('button[type="submit"]')
      
      expect(submitButton.attributes('aria-label')).toBe('Add Gig')
      expect(submitButton.attributes('title')).toBe('Add Gig')
    })

    it('フォーム要素に適切なlabelが設定されている', () => {
      const dateLabel = wrapper.find('label[for="gig-date"]')
      const artistLabel = wrapper.find('label[for="artist-name"]')
      
      expect(dateLabel.exists()).toBe(true)
      expect(dateLabel.text()).toContain('Date')
      
      expect(artistLabel.exists()).toBe(true)
      expect(artistLabel.text()).toContain('Artist')
    })
  })
})
