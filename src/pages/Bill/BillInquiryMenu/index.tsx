import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../stores/store';
import { BillService } from '../../../services/billService';
import { BillMenuResponse } from '../../../types/bill';
import './BillInquiryMenu.css';

const BillInquiryMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [menuData, setMenuData] = useState<BillMenuResponse | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 권한 체크
  useEffect(() => {
    console.log('BillInquiryMenu mounted');
    console.log('User permissions:', user?.permissions);
    if (!user?.permissions.includes('BILL_INQUIRY')) {
      console.log('No BILL_INQUIRY permission, redirecting to main');
      navigate('/main');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    loadMenuData();
  }, []);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.custom-select-wrapper')) {
          setIsDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const loadMenuData = async () => {
    try {
      setLoading(true);
      const data = await BillService.getBillMenu();
      setMenuData(data);
      setSelectedMonth(data.currentMonth); // 현재 월을 기본 선택
    } catch (err) {
      setError(err instanceof Error ? err.message : '요금조회 메뉴 로딩에 실패하였습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!menuData || isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      // lineNumber는 대시 포함 형태 유지, billingMonth는 YYYY-MM 형식에서 YYYYMM으로 변환
      navigate('/bill/inquiry-result', {
        state: {
          lineNumber: menuData.customerInfo.lineNumber, // 대시 포함: "010-1234-7777"
          billingMonth: selectedMonth // "2025-09" → billService에서 "202509"로 변환됨
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '요금 조회 신청에 실패하였습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/main');
  };

  if (loading) {
    return (
      <div className="bill-inquiry-menu">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bill-inquiry-menu">
        <div className="error">{error}</div>
        <button onClick={loadMenuData} className="retry-button">다시 시도</button>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="bill-inquiry-menu">
        <div className="error">메뉴 데이터를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="bill-inquiry-menu">
      <header className="bill-header">
        <div className="header-content">
          <button className="back-button" onClick={() => navigate(-1)}>
            ←
          </button>
          <h1 className="page-title">요금 조회</h1>
        </div>
      </header>

      <main className="bill-content">
        <div className="line-info">
          <div className="label">조회 대상 회선</div>
          <div className="line-number">📱 {menuData.customerInfo.lineNumber}</div>
        </div>

        <div className="inquiry-options">
          <h2 className="options-title">
            <span className="icon">📅</span>
            조회 옵션 설정
          </h2>
          
          <div className="tip-message">
            <span className="tip-icon">💡</span>
            <span className="tip-text">
              기본적으로 현재 월이 선택되어 있습니다. 다른 월을 조회하려면 드롭다운에서 선택해주세요.
            </span>
          </div>

          <div className="form-group">
            <div className="month-selector">
              <label className="field-label">조회월 선택</label>
              <div className="custom-select-wrapper">
                <button
                  className="custom-select-button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setIsDropdownOpen(!isDropdownOpen);
                    } else if (e.key === 'Escape') {
                      setIsDropdownOpen(false);
                    }
                  }}
                  aria-label="조회월 선택"
                  aria-expanded={isDropdownOpen}
                  type="button"
                >
                  <span className="selected-value">
                    {formatMonthDisplay(selectedMonth)}
                  </span>
                  <span className={`select-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
                </button>
                
                {isDropdownOpen && (
                  <div className="custom-dropdown">
                    {menuData.availableMonths.map(month => (
                      <button
                        key={month}
                        className={`dropdown-item ${month === selectedMonth ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedMonth(month);
                          setIsDropdownOpen(false);
                        }}
                        type="button"
                      >
                        {formatMonthDisplay(month)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="help-text">
                <span className="info-icon">ℹ️</span>
                최근 6개월 요금 정보를 조회할 수 있습니다
              </div>
            </div>

            <div className="info-section">
              <div className="info-title">
                <span className="info-icon">📋</span>
                조회 가능한 정보
              </div>
              <ul className="info-list">
                <li>• 월 요금 상세 내역 (기본료, 통화료, 데이터료 등)</li>
                <li>• 사용량 정보 (통화시간, 데이터 사용량, SMS 등)</li>
                <li>• 할인 및 혜택 내역</li>
                <li>• 단말기 할부금 및 기타 부대비용</li>
                <li>• 약정 정보 및 예상 해지비용</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="bill-footer">
        <button 
          className="cancel-button" 
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          취소
        </button>
        <button 
          className="submit-button" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? '조회 중...' : '요금 조회'}
        </button>
      </footer>
    </div>
  );
};

// 월 표시 형식 변환 (2025-09 → 2025년 9월)
const formatMonthDisplay = (month: string): string => {
  const [year, monthNum] = month.split('-');
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const suffix = month === currentMonth ? ' (현재 월)' : '';
  return `${year}년 ${parseInt(monthNum)}월${suffix}`;
};

export default BillInquiryMenu;