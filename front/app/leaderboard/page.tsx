import { SiteHeader } from '@/components/SiteHeader';

const FILTERS = ['Global', 'Regional', 'Friends', 'Current Season'] as const;

const LEADERBOARD_ROWS = [
  {
    rank: '#1',
    player: 'ShadowStriker',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCZmYZLzRkSFeAx3NykxZrd2e2OR4jWlOENhC0u6NpbOEDn3HlClSh9TXXD51YTuWlO5icjbS-Ih1iup0MVfWtj86jC7BSFYqUA-JC2pbnYBC--qX3LldbeKNqa3FoQ_OqwoRljlDTGpaPmOkhiKE8UM7oT3MijuDzdyrgL2LgV_hhuALfj8rbEkwUyRGpaOG7KTyV8CISEGbG0usxJFg_ISjNXsazSq4p4kuUYJigimod2iQUR8oAFTdqY23dIxV1FE1EvLIjlIMU',
    monsters: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDChPoNjj889peNVLrxHItSUCbOhBq64_BhsbnJZeVJ46VLyirBHx4PWPzYAALTfbTiGAjzZGrMuIOGqwPf7NHDTmS_FbJrMw3S_nlkQi4FF6cUB7h6fRjxIt1Y1Yw-JaDFvoOjNO_QV6VcrBlJ1-_i7gXCvu_R2D3TP6vkJJw4P1txoGHnZLefbtBTCuw8PFQZPaapOfiOCFENC5hRZWH2dO-YdqWO8Zr_aMANNxO2OFKOpsquU09KnXGS4kT2wObFPmQzNMRh2ms',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCwfx2kh5ObaCoPT25CQrR7jlzjxi8oiE1IYAkzUyHyh1pCssOm8-ebpqPJz6jN9RfXkZt1KVvSScXOcb7mgGa0K_tA7oLnXMwD6aESElkKP60pgqk4P3jh_Mmjjy9qvUP0PXLDPYJHNPJKTtXliuGQRHc72DHO51YXan6aOopu_FZRf6vjZhfkw_DHcB7ZpnphQasPG1kJCwcZIpHK29gpevx5y6TA3lPlJWKs-LE2I3Uyl2BRyKw8QteHiHveQN7S5Zet6x2hu-Q',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDCf9m1E_bRwfH0YFIEwIKd-PlXOtBur2JC8JnTmTXrn2X7xQ8oIzCbustY9O5Ou6QPcfVw893mvSW-p58vhfhKgaoNtbyfQPDzY4YN-jzmAmwS0fthXk0XRPEqwdXYEpRDGWgb28R4HT-COZBU9T0VP29gu6NaqSvjKcdiYVEwFnwEn3tVzf38sjJfRL0WG00TtMHMeByKic2nJCwk8AnMHY7lJ7ggOYOhmRMdEcbzZkosj3MZwdqi_L0RQSjTQWN__qWcw_KfRsU',
    ],
    teamPower: '1,250,000',
    wins: 342,
    winRate: '88%',
  },
  {
    rank: '#2',
    player: 'VortexViper',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA9fLPv7LZr4Ntyvd7PpiWnuFYQhi83lqbYl8EKqTgvyv0B2hTK6ftXNiSUd634NdQ4cvprKCnPmD4ewwphWvf6-BLKfRarbgfgRV-LUi-onzd8-kNey45UiRTc8BfZD7_ywQa1OtHhUdkGdi3wKubBl0m0EDmMTX6w9JYqD4JK78idKLJHDpHqYnTW7ptZdmt7yanysp5tucTxDJeznQ3zjpooklbwqd5gqB4esbxe2FmA3zORUEKr8k1TrCKWhhUu7OrvEqj9NUY',
    monsters: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDrtex3vA_bh10qUrhewYWT2hdzSm4UQCQ_NlDKhdaZq6eZdnGPgFuW8PYbRBKozblEh-DRlfKiTPU4l58OxJMOvzyFfv3jU8zuD7_d-pVtLwvhcgOM1UrH8edommc-JVzQpGc-aoE_z61-u2DEFJrry7hicDKVZnuFt7X0SOKxZgZjxxKMvjaDelbHVOs9uFIWE3cPBzzli9kWKz9pHvyFYMccZGIDMkTZUPXzRGrWL7FVI805m7xqyAwe4LwT1BsjpuVmU5Doabs',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBquYEmVeBXVNC81WI6jNUO0_oWR-RBBvi6GFqDjDZE5VlKILiVfYCr71hzwy9DyhK-OKZ9jnsmHS-Re0CcyXsxZJ-N_jBx15J-lJEmZUUiJkpwn4_bbeU9PcDF8JEzanJok_RhmF0Rm18ochwTXK68kSALU50zvurlZKHfEry9pg6FtIdnVbvWclYuN7rrY0JfW_zhggZxmP-NF6UKvYnTqZatELeyQVkJWox_wXJhJ7V6Cc79FL2_xDtDqIEIpstC1ZnFGmLE2TI',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCTB6z5OWIHP0Y1446SYlVAmjH0LC_FxsJkhLKS7oFXe_WCr-31P8AqyKhZU4N6Telzpvx0OAjUb0W0lrXpTy53QmLOBfwQRUe-nNk96NwwgmwpB70dyF7LmLprA4pVnlU64AVzxVfWkVAr7mbNuJba3VoXbYlZbX-sv-MPi1o9MvN9PbTXY7YFqJpwNliZ93gnNdBMxCsoN7zsg9_Argvx8Ha_oJwk5ODIx8AqZcTCKMOf3WBT333zKZEDMR1E3n0-QQ9P4wEHYZ0',
    ],
    teamPower: '1,210,000',
    wins: 315,
    winRate: '85%',
  },
  {
    rank: '#3',
    player: 'CyberWraith',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD1pcEOdZ6AfwGMORtKpNkOtK0ccxRW1a4wwJVzYwLNIH0ThRbJgN4qSHp9V6DwzlVSkF8WaYOjEh60nAKvovUp4mQ8ypbnJ3RDcL5kKjWsS7O2ajA2VUZ-FgwaH7rtoMtyxps8dduDslLnGwfBOV3qNUZp6mLOqKmdU1oM-d4JoKCbruXvOxcrhX-IlOeyQVSGVc1zTXgNiPOdVdcVfZ07xMUXTfSqihZ45dVnxx8pFhv2-riMVlRONraBCKwdy3eX0DyjDqD1TO0',
    monsters: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD5HE33ImHFexlZMcX45ZK4EKIoT466DhGOdGeIhe_zfnpsllzblRKVl2y58bDJgEJmaAR_XMDhZt6zuCx22L48ZSuNk0CosdQYe13vI-WCl08lBBSVLRCOhxFgASrAnpqwJNKepI4hhYcd_TNiWUl3NdmRF-5mDT7ZlvrCdOhovFzIA8Fnh3iO2wWpHO5rVPdl0lYpya8R4izspqpspV4o7GSoguTR1YUFADllmP8iVn3JN6XWZFChtZcBjs8hWAWjK1YEKRNCPQk',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDbBS2M2iw4paqQftbRtlnuMpLd8PSQDj0lrkY8mnKQfH82mvs0-3g7dqg376iFQpsLYRZ13jcy9QwNxc1i1gFTJJIBRevplC3iDCUybK6w4Dp1x0avdGM3RsEfQK7BiLIu68OB9mOLtWfGebiQ-0uuTUibsN450mYX8JDLqPd9n_hMj2iMAGQaPNLL35zhqDeJO1sOV5HWO5IlyO6RgHWyWU4MtljkSEAGSqQout2kHEIh4khSJa_1Zj_sQgb21uJPE1Tlhwk8dg0',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCuinU6WHCOFI8deXW0orptBNU9I6fhV8y00t39r8MB0aUKTMWaDfMaU6YhtJJl7cirQtFI2vWMILrcMVMEMotJYWyVAXaz_OTNZGx7tjPM_tr7K9otpulzOqtR1x8MnELkgddIdknXBtvJOptRmBju2Sj7ccc1tFsiCaRKY0BzwaXBFTX6BFxShYyWu8qOOolIPjRVEpBil6ODjpX_l2IqZ1IrF9_nR3FNTJeuPOulzjWjt3FaqCi3-h_EcDCnH72HDJwc4XMlIEI',
    ],
    teamPower: '1,180,000',
    wins: 299,
    winRate: '82%',
  },
  {
    rank: '#4',
    player: 'NovaFury',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAE60C2JMc8Wo_rGRocik7c6nFGji6362gcjw_kHk4x3HFqkM4Jujd9rbCw96tHQwnnifS6uom31uN6M9YUDP3-zmsPpAenOTUa1kUPdyEgrfUU_xUYEJcAEaIauhki3hV9KfSJ2sreiUV41XZsH_LK50Nc1QAVSpdWvqClKwcD25bLnV8Z-Sc9wLblU3gEVBHQoLMwZe4xRYQWZI2qixgNODZx7w51MX8zvG49slQ_gzITH8T2rQ52oFICKFiiewtia-Z21mkn-L8',
    monsters: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCFM1vVvt1IKWNhxpjCTpY7kSVZKwbtWm0M_eACqKepHgv9lTVJGp62nX5EdVZMlukBkL6eAZaEvb9zeivSlDYcd351KZD6T3VwF4pFPX0Ymg4o_Oj3cIojdZrUa5bUY4oRN6y_mO666pAgDBO-o46kMIoK_GOsdNpK9Xy-zcEWObbXCmTl3-Z-h7zMfvrzGgooEreJHYKz34W0zRvMpLkopLX4SBhLVJot1Te5_sv7sKbRUrsAqYL7eicumFNZR5ZxUB-bvlhGs2Y',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAYdocik_J9H4RUyevlkP-TTygNicgGHE2HraLx9h8nfbF3CagSUWO-xBEzUB5mZcvwZEkL5BiuhONRwVLXX3vMo-92vGKo7ae3ynBc3W2iay6S7aj5cLc7GfqUfl5p9UVFPCFpqR8jrs5_uegZJr0Pu-F-yikrmaTw0XXVU5TxGk8TM8sPBo8UmyxRgL1Qf89Z-3QR_RD1mpkb4Pb4eIf7lNUd9QtPY8Bt9T6LVZTwOSX0JN-M9iS_mgmiW0915Nl9QVZombia7kI',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCNyIhYd10So6pvqx-XBDnXy_f-wf8T7aSX_ArcPNJXx3epNRCXzjL29CubDnUvXenJ6_U4skZurPL_23OmLEi2-5Gkislxpbidf1QMLxS-Ye4bQdLVVV3QHUioGxAccr22a3LdJkqhZWFLdXmQEclqHWlIs44o2RxkxZXyCpn3pw-BHR3SKE8medSIMg6rIQqNISwZTMyFMKfw_oEMIEnSilxf-6p0WQKGlMYrt6i4M2aLwbtFa0UrXD1XMN_AQ5ao8ZXxb8-BiHk',
    ],
    teamPower: '1,155,000',
    wins: 280,
    winRate: '80%',
  },
  {
    rank: '#5',
    player: 'BlazeHeart',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuArEsBqblJLvq6mItuCj47wEwOYmevFmYeDzU076ZaIa5FfK-BfgcTSUyQSSF_6oAB-G9h3_SDnn__bVzHzeYyxTxwRxHeR2aLqCmH3bJ4mwkeu6LTDYZ6y2dohXejNEEUQCaM-93GGs3qtLDoI0iLwbQjT_3fqEEHCmxweV-83RLas0wWL9pWPSWit9y8IHY68TEQD0NK1xkAhkg92U8e-UQUjwo8Zf8EQTAYVifQ1TQN6xLTXT3tlGSaCiHcp3F1CPqPb0E7bY9c',
    monsters: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDAHLiFgwjQkr1G9tbZlhGBCkh865I7zLVR281ytDoEaESjtRaiHNIj8-boLb7DQz4bXD2e0YZaHtbcRmVGl3OcZ3ayDNFFKEqOO1COYYVykphSJbRNa4_y_bUCktTvV2gLBgWB6IygjGqvYDToEEpgeZFHmjf5gU32cnkwPDvrpkziMzVqmjzal8dP0YGD3U5bmwlwInFqgnYNFhXeXb2fFjBIWNzUvSk2dyT8H5Mx39oUCpxooYJ37-eAtsQ5TQGjkPJe-2mjymo',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDUiO_4rO6I8Rr8hS98_3yF6y2Ty3zhnPEuJPULv_EiyUTowBMNeJ1J93ejEQRkaF1FLhfbI9jmTor9cxp3bnkXPq9OB1d-B4BwyvYn2VUkEoIg7_SJZsvZcAj4S4bqZhvkQZKaBp6vPGrEBCm9nkCGOl4StpV3kRYCyZdhp3xLCQD1P5jonH5lhu6OF8hwO8oEeIlnH0mRk-KJv0Mk6010Ofl4mdBfVd4VKV8sRo2I6EmePcP4JSwuNPR5QGIthrUQDxnf0taO13E',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCo-rr8DE4XOsi3PhL4Vcc0slmEydTujsn-89SymguC6-fG1HRX9fDReJiR1pmB73-eWeX8vq8zJ6X2kOPNEc-vQxK32QBoUnZcuwHDuGQBP83rtKLPyX2o-xA6o4X_7SJjnjROVmBvcBjLmmFao0OEquHKW1AgvqtOrl4ZwoIwWg4NOgUZeLpieVMsP4RSWvl86pJe8mW5fDmmTx6LV8OWrd7cnCj74zds1rwBAWBERVEC6rcWcG94A60LLLlGdHK68SeHoqQv4CQ',
    ],
    teamPower: '1,120,000',
    wins: 275,
    winRate: '78%',
  },
] as const;

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-[#131022] text-white">
      <SiteHeader variant="glass" className="sticky top-6 z-50 mt-6" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
        <section className="space-y-2">
          <p className="text-4xl font-black tracking-tight">Hall of Champions</p>
          <p className="text-sm text-white/60">Last updated: 2 minutes ago</p>
        </section>

        <section className="flex flex-wrap items-center gap-3">
          {FILTERS.map((filter, index) => (
            <button
              key={filter}
              className={`h-9 rounded-lg px-4 text-sm font-medium transition ${
                index === 0 ? 'bg-[#330df2] text-white' : 'border border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              {filter}
            </button>
          ))}
        </section>

        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-[#330df2]/20 text-[#330df2]">
              <span className="material-symbols-outlined text-2xl">military_tech</span>
            </div>
            <div>
              <p className="text-base font-semibold">Your Rank: #1,234</p>
              <p className="text-sm text-white/70">You are in the top 15% of players!</p>
            </div>
          </div>
          <button className="h-10 rounded-lg bg-[#330df2] px-6 text-sm font-bold">Battle Now</button>
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/5 text-white/70">
              <tr>
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Player</th>
                <th className="px-4 py-3 font-medium">Monster Team</th>
                <th className="px-4 py-3 font-medium">Team Power</th>
                <th className="px-4 py-3 font-medium">Wins</th>
                <th className="px-4 py-3 font-medium">Win Rate</th>
              </tr>
            </thead>
            <tbody className="bg-[#0f0c1b]">
              {LEADERBOARD_ROWS.map((row) => (
                <LeaderboardRow key={row.player} row={row} />
              ))}
            </tbody>
          </table>
        </section>

        <section className="flex items-center justify-center gap-2">
          <button className="flex size-10 items-center justify-center rounded-lg border border-white/10 text-white/70 hover:bg-white/10">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              className={`size-10 rounded-lg text-sm font-bold ${
                page === 1 ? 'bg-[#330df2]' : 'border border-white/10 text-white/70 hover:bg-white/10'
              }`}
            >
              {page}
            </button>
          ))}
          <span className="text-white/50">…</span>
          <button className="size-10 rounded-lg border border-white/10 text-white/70 hover:bg-white/10">10</button>
          <button className="flex size-10 items-center justify-center rounded-lg border border-white/10 text-white/70 hover:bg-white/10">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </section>
      </main>
    </div>
  );
}

type LeaderboardRowData = (typeof LEADERBOARD_ROWS)[number];

function LeaderboardRow({ row }: { row: LeaderboardRowData }) {
  return (
    <tr className="border-t border-white/10">
      <td className="px-4 py-4 text-base font-bold text-white">{row.rank}</td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url(${row.avatar})` }}
            aria-label={`${row.player} avatar`}
          />
          <span className="text-white/80">{row.player}</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex -space-x-3">
          {row.monsters.map((monster, index) => (
            <div
              key={`${row.player}-monster-${index}`}
              className="h-10 w-10 rounded-full border-2 border-[#0f0c1b] bg-cover bg-center"
              style={{ backgroundImage: `url(${monster})` }}
              aria-label={`${row.player} monster ${index + 1}`}
            />
          ))}
        </div>
      </td>
      <td className="px-4 py-4 text-white/80">{row.teamPower}</td>
      <td className="px-4 py-4 text-white/80">{row.wins}</td>
      <td className="px-4 py-4 text-white/80">{row.winRate}</td>
    </tr>
  );
}
