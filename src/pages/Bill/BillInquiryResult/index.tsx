import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../stores/store';
import { BillInquiryResponse } from '../../../types/bill';
import { BillService } from '../../../services/billService';
import './BillInquiryResult.css';

interface BillInquiryResultState {
  lineNumber: string;
  billingMonth?: string;
}

interface BillDetailItem {
  label: string;
  amount: string;
  isDiscount?: boolean;
  discountType?: string | null;
}

const BillInquiryResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [billData, setBillData] = useState<BillInquiryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // 아코디언 상태 관리 - 모든 섹션을 초기에 열린 상태로 설정
  const [expandedSections, setExpandedSections] = useState({
    billDetail: true,
    usageInfo: true,
    additionalInfo: true
  });

  useEffect(() => {
    const state = location.state as BillInquiryResultState;
    
    if (!state?.lineNumber) {
      setError('요금조회를 위한 정보가 없습니다.');
      setLoading(false);
      return;
    }

    const fetchBillData = async () => {
      try {
        const response = await BillService.inquireBill({
          lineNumber: state.lineNumber, // 대시 포함 형태 유지: "010-1234-7777"
          billingMonth: state.billingMonth // "2025-09" → billService에서 "202509"로 변환됨
        });
        
        setBillData(response);
      } catch (err) {
        console.error('요금조회 실패:', err);
        setError(err instanceof Error ? err.message : '요금조회에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchBillData();
  }, [location.state]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatAmount = (amount: number): string => {
    return `${amount.toLocaleString()}원`;
  };

  const formatDate = (dateStr: string): string => {
    if (dateStr.length === 8) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
    }
    return dateStr;
  };

  const formatBillingMonth = (month: string): string => {
    if (month.length === 6) {
      const year = month.substring(0, 4);
      const monthNum = month.substring(4, 6);
      return `${year}년 ${parseInt(monthNum)}월`;
    }
    return month;
  };

  const getBillDetailItems = (): BillDetailItem[] => {
    if (!billData) return [];
    
    const { billInfo } = billData;
    const items: BillDetailItem[] = [
      { label: '기본료', amount: formatAmount(billInfo.monthlyFee) },
      { label: '사용료', amount: formatAmount(billInfo.usageFee) }
    ];
    
    // 할인 금액 항상 표시 (0원이어도 표시)
    items.push({
      label: '할인 금액',
      amount: billInfo.discountAmount > 0 ? `-${formatAmount(billInfo.discountAmount)}` : `${formatAmount(billInfo.discountAmount)}`,
      isDiscount: true,
      discountType: billInfo.discountAmount > 0 ? '요금제할인' : null
    });
    
    return items;
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleDifferentMonthClick = () => {
    navigate('/bill/inquiry-menu');
  };

  const handleMainClick = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="bill-inquiry-result">
        <div className="header">
          <button className="back-btn" onClick={handleBackClick}>
            ←
          </button>
          <h1>요금조회 결과</h1>
        </div>
        <div className="loading">요금조회 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bill-inquiry-result">
        <div className="header">
          <button className="back-btn" onClick={handleBackClick}>
            ←
          </button>
          <h1>요금조회 결과</h1>
        </div>
        <div className="error">
          <p>{error}</p>
          <button className="btn-secondary" onClick={handleBackClick}>
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  if (!billData) return null;

  const { billInfo, customerInfo } = billData;
  const billDetailItems = getBillDetailItems();

  return (
    <div className="bill-inquiry-result">
      <div className="header">
        <button className="back-btn" onClick={handleBackClick}>
          ←
        </button>
        <h1>요금조회 결과</h1>
      </div>

      <div className="bill-summary">
        <div className="billing-month">{formatBillingMonth(billInfo.billingMonth)}</div>
        <div className="total-amount">{formatAmount(billInfo.totalFee)}</div>
        <div className="product-name">{billInfo.productName}</div>
      </div>

      <div className="bill-sections">
        <div className="bill-section">
          <button 
            className={`section-header ${expandedSections.billDetail ? 'expanded' : ''}`}
            onClick={() => toggleSection('billDetail')}
          >
            <div className="section-title">
              <span className="icon">💰</span>
              <span>요금 상세 내역</span>
            </div>
            <span className="arrow">▼</span>
          </button>
          {expandedSections.billDetail && (
            <div className="section-content">
              {billDetailItems.map((item, index) => (
                <div key={index} className="detail-item">
                  <span className="label">{item.label}</span>
                  <span className={`amount ${item.isDiscount ? 'discount' : ''}`}>
                    {item.amount}
                    {item.isDiscount && item.discountType && (
                      <span className="discount-type">💫 {item.discountType}</span>
                    )}
                  </span>
                </div>
              ))}
              <div className="detail-item total">
                <span className="label">총 청구 요금</span>
                <span className="amount">{formatAmount(billInfo.totalFee)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bill-section">
          <button 
            className={`section-header ${expandedSections.usageInfo ? 'expanded' : ''}`}
            onClick={() => toggleSection('usageInfo')}
          >
            <div className="section-title">
              <span className="icon">📊</span>
              <span>사용량 정보</span>
            </div>
            <span className="arrow">▼</span>
          </button>
          {expandedSections.usageInfo && (
            <div className="section-content">
              <div className="usage-item">
                <span className="label">데이터 사용량</span>
                <span className="value">{billInfo.dataUsage}</span>
              </div>
              <div className="usage-item">
                <span className="label">통화 시간</span>
                <span className="value">{billInfo.voiceUsage}</span>
              </div>
              <div className="usage-item">
                <span className="label">SMS/MMS</span>
                <span className="value">{billInfo.smsUsage}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bill-section">
          <button 
            className={`section-header ${expandedSections.additionalInfo ? 'expanded' : ''}`}
            onClick={() => toggleSection('additionalInfo')}
          >
            <div className="section-title">
              <span className="icon">📄</span>
              <span>부가 정보</span>
            </div>
            <span className="arrow">▼</span>
          </button>
          {expandedSections.additionalInfo && (
            <div className="section-content">
              <div className="info-item">
                <span className="label">요금제 상태</span>
                <span className="value">{billInfo.billStatus === 'CONFIRMED' ? '확정' : billInfo.billStatus}</span>
              </div>
              <div className="info-item">
                <span className="label">납부 기한</span>
                <span className="value">{formatDate(billInfo.dueDate)}</span>
              </div>
              <div className="info-item">
                <span className="label">고객명</span>
                <span className="value">{user?.userName || '고객'}</span>
              </div>
              <div className="info-item">
                <span className="label">회선 상태</span>
                <span className="value">{customerInfo.lineStatus === 'ACTIVE' ? '사용중' : customerInfo.lineStatus}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="action-buttons">
        <button className="btn-secondary" onClick={handleDifferentMonthClick}>
          다른 월 조회
        </button>
        <button className="btn-primary" onClick={handleMainClick}>
          메인으로
        </button>
      </div>
    </div>
  );
};

export default BillInquiryResult;