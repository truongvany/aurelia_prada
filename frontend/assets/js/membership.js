import { getUserInfo, getUserProfile } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = getUserInfo();
    const memTabs = document.querySelectorAll('.mem-tab');
    
    // Switch tabs logic
    const tabContents = document.querySelectorAll('.mem-tab-content');
    memTabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            memTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            tabContents[index].classList.add('active');
        });
    });

    if (user) {
        try {
            const profile = await getUserProfile();
            updateUIMembership(profile);
            renderPointHistory(profile);
            renderVouchers(profile);
        } catch (error) {
            console.error('Failed to load user profile in membership page', error);
        }
    } else {
        // If not logged in
        const heroH1 = document.querySelector('.membership-hero h1');
        if (heroH1) heroH1.innerHTML += ' <br><small style="font-size:12px; color:#ffda79;">Đăng nhập để xem điểm!</small>';
        const voucherList = document.getElementById('voucher-list');
        if (voucherList) voucherList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">Hãy đăng nhập để tham gia đổi thưởng!</div>';
    }
});

async function renderVouchers(user) {
    const voucherList = document.getElementById('voucher-list');
    if (!voucherList) return;

    try {
        const { fetchRewardVouchers } = await import('./api.js');
        const rewardVouchers = await fetchRewardVouchers();
        
        if (!rewardVouchers || rewardVouchers.length === 0) {
            voucherList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999; border: 1px dashed #eee; border-radius: 4px;">Hiện tại chưa có voucher nào khả dụng.</div>';
            return;
        }

        voucherList.innerHTML = rewardVouchers.map((v, index) => {
            const colors = ['red', 'blue', 'green'];
            const colorClass = colors[index % colors.length];
            const canAfford = user.points >= v.pointsCost;

            return `
                <div class="aura-ticket ${colorClass}">
                    <div class="ticket-main">
                        <div class="ticket-val">${v.discountType === 'percent' ? v.discountAmount + '%' : (v.discountAmount / 1000) + 'K'}</div>
                        <div class="ticket-label">Voucher Giảm Giá</div>
                        <div class="ticket-info">${v.description}</div>
                    </div>
                    <div class="ticket-footer">
                        <div class="ticket-code">${v.code}</div>
                        <button class="btn-redeem" ${!canAfford ? 'disabled' : ''} 
                                onclick="handleRedeem('${v._id}', ${v.pointsCost}, this)">
                            ${canAfford ? `Đổi ${v.pointsCost} điểm` : `Thiếu ${v.pointsCost - user.points} điểm`}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Fetch vouchers error:', error);
        voucherList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #e74c3c;">Lỗi khi tải danh sách voucher.</div>';
    }
}

window.handleRedeem = async function(voucherId, cost, btn) {
    if (!confirm(`Bạn có chắc muốn dùng ${cost} điểm để đổi voucher này?`)) return;

    try {
        const { redeemVoucher } = await import('./api.js');
        const result = await redeemVoucher(voucherId);
        
        alert(`Chúc mừng! ${result.message}\nMã của bạn là: ${result.code}`);
        
        // Refresh page to update points UI
        window.location.reload();
    } catch (error) {
        alert(error.message);
    }
}

async function renderPointHistory(user) {
    const historyBody = document.getElementById('points-history-body');
    if (!historyBody) return;

    try {
        const { getMyOrders } = await import('./api.js');
        const orders = await getMyOrders();
        
        const historyItems = [];
        
        // 1. Point from orders
        orders.forEach(order => {
            if (order.status === 'Delivered') {
                const pts = Math.floor(order.totalPrice / 10000);
                if (pts > 0) {
                    historyItems.push({
                        date: new Date(order.deliveredAt || order.updatedAt).toLocaleDateString('vi-VN'),
                        content: `Tích điểm đơn hàng #${order._id.substring(0,8).toUpperCase()}`,
                        points: pts,
                        status: 'Đã hoàn thành'
                    });
                }
            }
        });

        // 2. Mocked system rewards (First time registration etc)
        historyItems.push({
            date: new Date(user.createdAt || Date.now()).toLocaleDateString('vi-VN'),
            content: 'Thưởng đăng ký thành viên mới',
            points: 10,
            status: 'Hệ thống'
        });

        if (historyItems.length === 0) {
            historyBody.innerHTML = '<tr><td colspan="4" style="padding: 20px; text-align: center; color: #999;">Bạn chưa có lịch sử tích điểm nào.</td></tr>';
            return;
        }

        historyItems.sort((a, b) => {
             const [dA, mA, yA] = a.date.split('/');
             const [dB, mB, yB] = b.date.split('/');
             return new Date(yB, mB-1, dB) - new Date(yA, mA-1, dA);
        });

        historyBody.innerHTML = historyItems.map(item => `
            <tr>
                <td style="white-space: nowrap;">${item.date}</td>
                <td>${item.content}</td>
                <td class="${item.points > 0 ? 'point-up' : 'point-down'}">${item.points > 0 ? '+' : ''}${item.points}</td>
                <td><span style="font-size:11px; padding:2px 8px; border-radius:10px; background:#eee;">${item.status}</span></td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Points history error:', error);
        historyBody.innerHTML = '<tr><td colspan="4" style="padding: 20px; text-align: center; color: #e74c3c;">Lỗi khi tải lịch sử.</td></tr>';
    }
}

function updateUIMembership(user) {
    const heroH1 = document.querySelector('.membership-hero h1');
    const rankMap = { 'Basic': 'THƯỜNG', 'Premium': 'CAO CẤP', 'VVIP': 'KIM CƯƠNG' };
    const userRank = rankMap[user.membershipLevel] || 'THƯỜNG';

    if (heroH1) {
        heroH1.innerHTML = `CHÀO ${user.name.toUpperCase()}, HẠNG ${userRank}`;
        const pointsInfo = document.createElement('p');
        pointsInfo.style.fontSize = '14px';
        pointsInfo.style.fontWeight = 'bold';
        pointsInfo.style.color = '#ffda79';
        pointsInfo.style.marginTop = '8px';
        pointsInfo.textContent = `Bạn đang có: ${(user.points || 0).toLocaleString()} điểm`;
        heroH1.parentElement.appendChild(pointsInfo);
    }

    const redempPoints = document.getElementById('redemption-points-display');
    if (redempPoints) {
        redempPoints.textContent = `Số điểm khả dụng: ${(user.points || 0).toLocaleString()} điểm`;
    }

    const plans = document.querySelectorAll('.plan-card');
    plans.forEach(plan => {
        const title = plan.querySelector('h3').textContent;
        if (user.membershipLevel === 'Premium' && (title.includes('Premium') || title.includes('Cao cấp'))) {
            plan.style.borderColor = '#000';
            plan.querySelector('.btn-plan').textContent = 'ĐANG SỬ DỤNG';
        } else if (user.membershipLevel === 'VVIP' && (title.includes('VVIP') || title.includes('Kim cương'))) {
            plan.style.borderColor = '#000';
            plan.querySelector('.btn-plan').textContent = 'ĐANG SỬ DỤNG';
        } else if (user.membershipLevel === 'Basic' && (title.includes('Thường') || title.includes('Basic'))) {
             plan.querySelector('.btn-plan').textContent = 'ĐANG SỬ DỤNG';
        }
    });
}
