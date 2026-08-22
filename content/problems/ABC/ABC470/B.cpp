#include <bits/stdc++.h>
#define rep(i, n) for (int i = 0; i < (n); i++)
using namespace std;

int main() {
    int N;
    cin >> N;
    vector<int> amount(N + 1, 0);
    rep(i, N) {
        int num = 0;
        cin >> num;
        amount.at(num)++;
    }
    int max = *max_element(amount.begin(), amount.end());
    cout << N - max << endl;
}
